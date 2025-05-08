import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 定义并导出 AuthState 和 AuthContextType
export type AuthState = {
  isAuthenticated: boolean | null | undefined;
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null | undefined;
};

export type AuthContextType = {
  authState: AuthState;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

// 导出 AuthContext 变量
export const AuthContext = createContext<AuthContextType | null>(null);

// 修正 Props 类型
export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: null,
    isSignout: false,
    userToken: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken = undefined;
      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // 忽略错误
      }
      setAuthState((prev) => ({
        ...prev,
        isAuthenticated: userToken ? true : false,
        userToken: userToken,
        isLoading: false,
      }));
    };
    bootstrapAsync();
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem('userToken', token);
    setAuthState((prev) => ({
      ...prev,
      userToken: token,
      isAuthenticated: token ? true : false,
      isSignout: false,
    }));
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setAuthState((prev) => ({
      ...prev,
      userToken: null,
      isAuthenticated: false,
      isSignout: true,
    }));
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用示例
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return context;
};
