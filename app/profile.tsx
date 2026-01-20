import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import RouteGuard from '@/components/Common/RouteGuard';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Input, InputField } from '@/components/ui/input';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import { useToast, Toast, ToastDescription, ToastTitle } from '@/components/ui/toast';
import * as Yup from 'yup';
import { getUserProfileAsync, updateUserProfileAsync } from '@/api/account';
import type { UserProfile, UpdateUserProfileDto } from '@/types/account/index.types';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('姓名不能为空').min(2, '姓名至少需要2个字符'),
  email: Yup.string().email('邮箱格式不正确').required('邮箱不能为空'),
  phone: Yup.string().matches(/^1[3-9]\d{9}$/, '手机号格式不正确'),
});

export default function Profile() {
  const navigation = useNavigation();
  const router = useRouter();
  const { authState } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UpdateUserProfileDto>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '个人资料',
      headerBackVisible: true,
    });
  }, [navigation]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfileAsync();
      setProfile(userProfile);
      setFormData({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      });
    } catch (error) {
      console.error('加载个人资料失败:', error);
      toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>加载失败</ToastTitle>
              <ToastDescription>无法加载个人资料，请稍后重试</ToastDescription>
            </Toast>
          );
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (error: any) {
      const validationErrors: Record<string, string> = {};
      if (error.inner) {
        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>验证失败</ToastTitle>
              <ToastDescription>请检查输入的信息是否正确</ToastDescription>
            </Toast>
          );
        },
      });
      return;
    }

    try {
      setSaving(true);
      await updateUserProfileAsync(formData);
      toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>保存成功</ToastTitle>
              <ToastDescription>个人资料已更新</ToastDescription>
            </Toast>
          );
        },
      });
      // 重新加载个人资料
      await loadProfile();
      // 延迟返回，让用户看到成功提示
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      console.error('保存个人资料失败:', error);
      toast.show({
        placement: 'top',
        duration: 3000,
        render: ({ id }) => {
          return (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>保存失败</ToastTitle>
              <ToastDescription>
                {error?.response?.data?.message || '无法保存个人资料，请稍后重试'}
              </ToastDescription>
            </Toast>
          );
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      '更换头像',
      '请选择头像来源',
      [
        {
          text: '拍照',
          onPress: () => {
            // TODO: 实现拍照功能
            Alert.alert('提示', '拍照功能开发中');
          },
        },
        {
          text: '从相册选择',
          onPress: () => {
            // TODO: 实现相册选择功能
            Alert.alert('提示', '相册选择功能开发中');
          },
        },
        {
          text: '取消',
          style: 'cancel',
        },
      ],
    );
  };

  const renderContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 头像部分 */}
        <Card className="m-4 p-4 rounded-lg">
          <VStack space="md" className="items-center">
            <TouchableOpacity
              onPress={handleChangeAvatar}
              activeOpacity={0.7}
              style={styles.avatarContainer}
            >
              <Avatar size="xl" className="bg-primary-500">
                <AvatarFallbackText className="text-white font-bold">
                  {formData.name.charAt(0).toUpperCase() || 'U'}
                </AvatarFallbackText>
                {profile?.avatarUrl && (
                  <AvatarImage source={{ uri: profile.avatarUrl }} />
                )}
              </Avatar>
              <View style={styles.avatarEditIcon}>
                <AntDesign name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text className="text-sm text-typography-600">
              点击头像更换
            </Text>
          </VStack>
        </Card>

        {/* 表单部分 */}
        <Card className="mx-4 mb-4 p-4 rounded-lg">
          <VStack space="lg">
            {/* 姓名 */}
            <FormControl isInvalid={!!errors.name}>
              <FormControlLabel>
                <FormControlLabelText>姓名</FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) {
                      setErrors({ ...errors, name: '' });
                    }
                  }}
                />
              </Input>
              {errors.name && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.name}
                </Text>
              )}
            </FormControl>

            {/* 邮箱 */}
            <FormControl isInvalid={!!errors.email}>
              <FormControlLabel>
                <FormControlLabelText>邮箱</FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="请输入邮箱"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
              {errors.email && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.email}
                </Text>
              )}
            </FormControl>

            {/* 手机号 */}
            <FormControl isInvalid={!!errors.phone}>
              <FormControlLabel>
                <FormControlLabelText>手机号</FormControlLabelText>
              </FormControlLabel>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="请输入手机号"
                  value={formData.phone}
                  onChangeText={(text) => {
                    setFormData({ ...formData, phone: text });
                    if (errors.phone) {
                      setErrors({ ...errors, phone: '' });
                    }
                  }}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </Input>
              {errors.phone && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.phone}
                </Text>
              )}
            </FormControl>
          </VStack>
        </Card>

        {/* 保存按钮 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                保存
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (loading) {
    return (
      <RouteGuard>
        {Platform.OS === 'web' ? (
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1890FF" />
              <Text className="mt-4 text-typography-600">加载中...</Text>
            </View>
          </View>
        ) : (
          <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1890FF" />
              <Text className="mt-4 text-typography-600">加载中...</Text>
            </View>
          </SafeAreaView>
        )}
      </RouteGuard>
    );
  }

  return (
    <RouteGuard>
      {Platform.OS === 'web' ? (
        <View style={styles.container}>{renderContent()}</View>
      ) : (
        <SafeAreaView style={styles.container} edges={['top']}>
          {renderContent()}
        </SafeAreaView>
      )}
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1890FF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#1890FF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
