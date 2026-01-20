import { LoginResult, UserProfile, UpdateUserProfileDto } from '@/types/account/index.types';
import apiClient from '../client';

export const loginAsync = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<LoginResult> => {
  const response = await apiClient.post<LoginResult>(
    '/connect/token',
    {
      grant_type: 'password',
      username: username,
      password: password,
      client_id: 'BgApp_App',
      scope: 'BgApp',
    },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  return response.data;
};

/**
 * 获取当前用户个人资料
 */
export const getUserProfileAsync = async (): Promise<UserProfile> => {
  // TODO: 替换为实际的 API 端点
  // 这里使用模拟数据，实际应该调用后端 API
  const response = await apiClient.get<UserProfile>('/account/profile');
  return response.data;
};

/**
 * 更新用户个人资料
 */
export const updateUserProfileAsync = async (
  data: UpdateUserProfileDto,
): Promise<UserProfile> => {
  // TODO: 替换为实际的 API 端点
  const response = await apiClient.put<UserProfile>('/account/profile', data);
  return response.data;
};
