import { LoginResult } from '@/types/account/index.types';
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
