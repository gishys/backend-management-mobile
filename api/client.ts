// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'http://192.168.2.81:44359',
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
  (error: AxiosError<{ message?: string }>) => {
    const errorMessage = error.response?.data?.message || error.message;

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
