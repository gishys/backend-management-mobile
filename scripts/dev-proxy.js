// 开发环境代理服务器
// 用于解决 Web 平台的 CORS 问题
// 使用方法：node scripts/dev-proxy.js

const http = require('http');
const httpProxy = require('http-proxy');

const PORT = 3001; // 代理服务器端口
const API_TARGET = 'http://192.168.2.13:44359'; // 后端 API 地址

// 创建代理服务器
const proxy = httpProxy.createProxyServer({
  target: API_TARGET,
  changeOrigin: true,
  secure: false,
});

// 处理代理错误
proxy.on('error', (err, req, res) => {
  console.error('[PROXY ERROR]', err);
  if (!res.headersSent) {
    res.writeHead(500, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
});

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  // 添加 CORS 响应头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 移除 /api 前缀
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace(/^\/api/, '');
  }

  // 记录请求
  const targetUrl = `${API_TARGET}${req.url}`;
  console.log(`[PROXY] ${req.method} ${req.url} -> ${targetUrl}`);

  // 代理请求
  proxy.web(req, res, {
    target: API_TARGET,
  });
});

// 监听端口
server.listen(PORT, () => {
  console.log(`🚀 开发代理服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 代理目标: ${API_TARGET}`);
  console.log(`💡 使用 /api 前缀访问后端 API`);
});
