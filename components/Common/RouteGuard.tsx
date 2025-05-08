import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';

const RouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 认证检查完成后执行跳转
    if (!authState.isAuthenticated) {
      router.replace('/login');
    }
  }, [authState.isAuthenticated, router]); // 依赖项确保状态或路由变化时重新触发

  // 未认证时直接返回null，避免渲染子组件
  if (!authState.isAuthenticated) {
    return null;
  }

  return children;
};

export default RouteGuard;
