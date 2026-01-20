import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthProvider';
import { loginAsync } from '@/api/account';
import { router } from 'expo-router';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text as UIText } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

type FormData = {
  username: string;
  password: string;
};

const STORAGE_KEYS = {
  REMEMBER_USERNAME: 'remember_username',
  SAVED_USERNAME: 'saved_username',
};

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberUsername, setRememberUsername] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const [toastId, setToastId] = useState<string>('');

  const username = watch('username');

  // 加载保存的用户名
  useEffect(() => {
    const loadSavedUsername = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_USERNAME);
        if (saved === 'true') {
          setRememberUsername(true);
          const savedUsername = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_USERNAME);
          if (savedUsername) {
            setValue('username', savedUsername);
          }
        }
      } catch (error) {
        console.error('加载保存的用户名失败:', error);
      }
    };
    loadSavedUsername();
  }, [setValue]);

  // 保存/清除用户名
  useEffect(() => {
    const saveUsername = async () => {
      try {
        if (rememberUsername && username) {
          await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_USERNAME, 'true');
          await AsyncStorage.setItem(STORAGE_KEYS.SAVED_USERNAME, username);
        } else if (!rememberUsername) {
          await AsyncStorage.removeItem(STORAGE_KEYS.REMEMBER_USERNAME);
          await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_USERNAME);
        }
      } catch (error) {
        console.error('保存用户名失败:', error);
      }
    };
    saveUsername();
  }, [rememberUsername, username]);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    const newId = Math.random().toString();
    setToastId(newId);
    toast.show({
      id: newId,
      placement: 'top',
      duration: 3000,
      render: ({ id }) => {
        return (
          <Toast nativeID={`toast-${id}`} action={type} variant="solid">
            <ToastTitle>{type === 'error' ? '登录失败' : '登录成功'}</ToastTitle>
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const result = await loginAsync({
        username: data.username.trim(),
        password: data.password,
      });

      await login(result.access_token);

      // 显示成功提示
      showToast('登录成功，正在跳转...', 'success');

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.replace('/(tabs)/approve');
      }, 500);
    } catch (error: any) {
      console.error('登录失败:', error);

      // 提取错误信息
      let errorMessage = '登录失败，请检查用户名和密码';
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.error_description) {
          errorMessage = errorData.error_description;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // 根据错误类型显示不同的提示
      if (error?.response?.status === 401) {
        errorMessage = '用户名或密码错误';
      } else if (error?.response?.status === 400) {
        errorMessage = '请求参数错误，请检查输入';
      } else if (error?.response?.status === 500) {
        errorMessage = '服务器错误，请稍后重试';
      } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
        errorMessage = '网络连接失败，请检查网络设置';
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: 实现忘记密码功能
    showToast('忘记密码功能开发中', 'error');
  };

  const handleRegister = () => {
    // TODO: 实现注册功能
    showToast('注册功能开发中', 'error');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <View style={styles.logoWrapper}>
                  <Ionicons name="business" size={48} color="#fff" />
                </View>
              </View>

              {/* 标题 */}
              <Heading size="2xl" className="text-white text-center mb-2">
                欢迎回来
              </Heading>
              <UIText className="text-white text-center mb-8 opacity-90">
                请登录您的账号
              </UIText>

              {/* 表单 */}
              <VStack space="lg" className="w-full">
                {/* 用户名输入 */}
                <View>
                  <Controller
                    control={control}
                    rules={{
                      required: '用户名不能为空',
                      minLength: {
                        value: 2,
                        message: '用户名至少需要2个字符',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="lg"
                        isInvalid={!!errors.username}
                        className="bg-white/20 border-white/30"
                      >
                        <InputSlot className="pl-4">
                          <InputIcon>
                            <Ionicons name="person-outline" size={20} color="#fff" />
                          </InputIcon>
                        </InputSlot>
                        <InputField
                          placeholder="请输入用户名"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="none"
                          autoCorrect={false}
                          style={styles.inputField}
                        />
                      </Input>
                    )}
                    name="username"
                  />
                  {errors.username && (
                    <UIText className="text-red-300 text-xs mt-1 ml-4">
                      {errors.username.message}
                    </UIText>
                  )}
                </View>

                {/* 密码输入 */}
                <View>
                  <Controller
                    control={control}
                    rules={{
                      required: '密码不能为空',
                      minLength: {
                        value: 6,
                        message: '密码至少需要6个字符',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="lg"
                        isInvalid={!!errors.password}
                        className="bg-white/20 border-white/30"
                      >
                        <InputSlot className="pl-4">
                          <InputIcon>
                            <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                          </InputIcon>
                        </InputSlot>
                        <InputField
                          placeholder="请输入密码"
                          placeholderTextColor="rgba(255,255,255,0.6)"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          secureTextEntry={!showPassword}
                          style={styles.inputField}
                        />
                        <InputSlot className="pr-4">
                          <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <InputIcon>
                              <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#fff"
                              />
                            </InputIcon>
                          </Pressable>
                        </InputSlot>
                      </Input>
                    )}
                    name="password"
                  />
                  {errors.password && (
                    <UIText className="text-red-300 text-xs mt-1 ml-4">
                      {errors.password.message}
                    </UIText>
                  )}
                </View>

                {/* 记住用户名 */}
                <HStack space="sm" className="items-center">
                  <Pressable
                    onPress={() => setRememberUsername(!rememberUsername)}
                    className="flex-row items-center"
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberUsername && styles.checkboxChecked,
                      ]}
                    >
                      {rememberUsername && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <UIText className="text-white text-sm ml-2">
                      记住用户名
                    </UIText>
                  </Pressable>
                </HStack>

                {/* 登录按钮 */}
                <Pressable
                  onPress={handleSubmit(onSubmit)}
                  disabled={isLoading || !isValid}
                  className={`mt-4 rounded-full overflow-hidden ${
                    isLoading || !isValid ? 'opacity-60' : ''
                  }`}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <UIText className="text-white font-bold text-base">
                        登录
                      </UIText>
                    )}
                  </LinearGradient>
                </Pressable>

                {/* 底部链接 */}
                <HStack space="md" className="justify-between mt-4">
                  <Pressable onPress={handleForgotPassword}>
                    <UIText className="text-white text-sm underline opacity-90">
                      忘记密码？
                    </UIText>
                  </Pressable>
                  <Pressable onPress={handleRegister}>
                    <UIText className="text-white text-sm underline opacity-90">
                      注册账号
                    </UIText>
                  </Pressable>
                </HStack>
              </VStack>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  inputField: {
    color: '#fff',
    fontSize: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#fff',
  },
  loginButton: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
});
