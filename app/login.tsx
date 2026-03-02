import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthProvider';
import { loginAsync } from '@/api/account';
import { router } from 'expo-router';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { LoginHeader, LoginForm } from '@/components/login';
import type { LoginFormData } from '@/components/login';
import { loginTheme } from '@/constants/loginTheme';

const STORAGE_KEYS = {
  REMEMBER_USERNAME: 'remember_username',
  SAVED_USERNAME: 'saved_username',
} as const;

const CONTENT_MAX_WIDTH = 400;

/**
 * 从接口错误中提取用户可读的登录错误信息
 */
function getLoginErrorMessage(error: unknown): string {
  const fallback = '登录失败，请检查用户名和密码';
  if (!error || typeof error !== 'object') return fallback;

  const err = error as { response?: { data?: unknown; status?: number }; message?: string; code?: string };
  const data = err?.response?.data as Record<string, unknown> | string | undefined;

  if (typeof data === 'string') return data;
  if (data?.error_description && typeof data.error_description === 'string') return data.error_description;
  if (data?.message && typeof data.message === 'string') return data.message;
  const nested = data?.error as Record<string, unknown> | undefined;
  if (nested?.message && typeof nested.message === 'string') return nested.message;
  if (err?.message && typeof err.message === 'string') return err.message;

  const status = err?.response?.status;
  if (status === 401) return '用户名或密码错误';
  if (status === 400) return '请求参数错误，请检查输入';
  if (status === 500) return '服务器错误，请稍后重试';

  const msg = String(err?.message ?? '');
  if (err?.code === 'NETWORK_ERROR' || msg.includes('Network')) return '网络连接失败，请检查网络设置';

  return fallback;
}

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: { username: '', password: '' },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const username = watch('username');

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_USERNAME);
        if (saved === 'true') {
          setRememberUsername(true);
          const savedUsername = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_USERNAME);
          if (savedUsername) setValue('username', savedUsername);
        }
      } catch (e) {
        console.error('加载保存的用户名失败:', e);
      }
    };
    load();
  }, [setValue]);

  useEffect(() => {
    const save = async () => {
      try {
        if (rememberUsername && username) {
          await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_USERNAME, 'true');
          await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERNAME, username);
        } else if (!rememberUsername) {
          await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_USERNAME);
          await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_USERNAME);
        }
      } catch (e) {
        console.error('保存用户名失败:', e);
      }
    };
    save();
  }, [rememberUsername, username]);

  const showToast = useCallback(
    (message: string, type: 'error' | 'success' = 'error') => {
      const id = Math.random().toString();
      toast.show({
        id,
        placement: 'top',
        duration: 3000,
        render: ({ id: toastId }) => (
          <Toast nativeID={`toast-${toastId}`} action={type} variant="solid">
            <ToastTitle>{type === 'error' ? '登录失败' : '登录成功'}</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        ),
      });
    },
    [toast]
  );

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      if (isLoading) return;
      Keyboard.dismiss();
      setIsLoading(true);
      try {
        const result = await loginAsync({
          username: data.username.trim(),
          password: data.password,
        });
        await login(result.access_token);
        showToast('登录成功，正在跳转...', 'success');
        setTimeout(() => router.replace('/(tabs)/approve'), 500);
      } catch (error) {
        console.error('登录失败:', error);
        showToast(getLoginErrorMessage(error), 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, login, showToast]
  );

  const handleForgotPassword = useCallback(() => {
    showToast('忘记密码功能开发中', 'error');
  }, [showToast]);

  const handleRegister = useCallback(() => {
    showToast('注册功能开发中', 'error');
  }, [showToast]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <LinearGradient
        colors={[loginTheme.gradient.start, loginTheme.gradient.end]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <LoginHeader />
              <LoginForm
                control={control}
                errors={errors}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((v) => !v)}
                rememberUsername={rememberUsername}
                onToggleRemember={() => setRememberUsername((v) => !v)}
                onSubmit={handleSubmit(onSubmit)}
                isLoading={isLoading}
                isValid={isValid}
                onForgotPassword={handleForgotPassword}
                onRegister={handleRegister}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: loginTheme.spacing.pageHorizontal,
    paddingVertical: loginTheme.spacing.pageVertical,
  },
  content: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});
