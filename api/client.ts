// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 根据平台和环境设置 baseURL
// Web 平台在开发环境使用代理路径，避免 CORS 问题
const getBaseURL = () => {
  const API_BASE_URL = 'http://192.168.2.13:44359';
  
  if (Platform.OS === 'web' && __DEV__) {
    // Web 平台开发环境：使用代理服务器
    // 代理服务器运行在 http://localhost:3001，将 /api 请求转发到后端
    return 'http://localhost:3001/api';
  }
  // 原生平台（iOS/Android）或生产环境：直接使用完整 URL
  // 原生平台不受浏览器 CORS 限制
  return API_BASE_URL;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器（添加 Token）
apiClient.interceptors.request.use(async (config) => {
  (config as any).metadata = { startTime: Date.now() };
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器（错误处理）
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config as any).metadata.startTime;
    console.log(`请求耗时: ${duration}ms`);
    return response;
  },
  (
    error:
      | AxiosError<{ message?: string } | { error?: { message?: string } }>
      | any,
  ) => {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message;

    // 统一错误提示
    Alert.alert('请求错误', errorMessage);

    // 401 跳转登录
    if (error.response?.status === 401) {
      // 这里可以触发全局退出登录逻辑
    }

    return Promise.reject(error);
  },
);

export default apiClient;
