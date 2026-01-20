export type LoginResult = {
  access_token: string;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateUserProfileDto = {
  name: string;
  email: string;
  phone?: string;
};