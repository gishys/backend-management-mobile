import React from 'react';
import { View, StyleSheet, ActivityIndicator, Keyboard } from 'react-native';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text as UIText } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { loginTheme } from '@/constants/loginTheme';

export type LoginFormData = {
  username: string;
  password: string;
};

type LoginFormProps = {
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  showPassword: boolean;
  onTogglePassword: () => void;
  rememberUsername: boolean;
  onToggleRemember: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isValid: boolean;
  onForgotPassword: () => void;
  onRegister: () => void;
};

/**
 * 登录表单：用户名、密码、记住用户名、登录按钮、底部链接
 */
export function LoginForm({
  control,
  errors,
  showPassword,
  onTogglePassword,
  rememberUsername,
  onToggleRemember,
  onSubmit,
  isLoading,
  isValid,
  onForgotPassword,
  onRegister,
}: LoginFormProps) {
  const { colors, radius, size } = loginTheme;

  const inputContainerStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
  };

  return (
    <VStack space="lg" className="w-full">
      {/* 用户名 */}
      <View>
        <Controller
          control={control}
          rules={{
            required: '用户名不能为空',
            minLength: { value: 2, message: '用户名至少需要2个字符' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              variant="outline"
              size="lg"
              isInvalid={!!errors.username}
              className="border-white/30"
              style={[styles.input, inputContainerStyle]}
            >
              <InputSlot className="pl-4">
                <InputIcon>
                  <Ionicons name="person-outline" size={20} color={colors.icon} />
                </InputIcon>
              </InputSlot>
              <InputField
                placeholder="请输入用户名"
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.inputField, { color: colors.text }]}
                accessibilityLabel="用户名"
                accessibilityHint="输入您的登录用户名"
              />
            </Input>
          )}
          name="username"
        />
        {errors.username && (
          <UIText style={[styles.errorText, { color: colors.errorText }]}>
            {errors.username.message}
          </UIText>
        )}
      </View>

      {/* 密码 */}
      <View>
        <Controller
          control={control}
          rules={{
            required: '密码不能为空',
            minLength: { value: 6, message: '密码至少需要6个字符' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              variant="outline"
              size="lg"
              isInvalid={!!errors.password}
              className="border-white/30"
              style={[styles.input, inputContainerStyle]}
            >
              <InputSlot className="pl-4">
                <InputIcon>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
                </InputIcon>
              </InputSlot>
              <InputField
                placeholder="请输入密码"
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                style={[styles.inputField, { color: colors.text }]}
                accessibilityLabel="密码"
                accessibilityHint="输入您的登录密码"
              />
              <InputSlot className="pr-4">
                <Pressable
                  onPress={onTogglePassword}
                  accessibilityLabel={showPassword ? '隐藏密码' : '显示密码'}
                  accessibilityRole="button"
                >
                  <InputIcon>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.icon}
                    />
                  </InputIcon>
                </Pressable>
              </InputSlot>
            </Input>
          )}
          name="password"
        />
        {errors.password && (
          <UIText style={[styles.errorText, { color: colors.errorText }]}>
            {errors.password.message}
          </UIText>
        )}
      </View>

      {/* 记住用户名 */}
      <HStack space="sm" className="items-center">
        <Pressable
          onPress={onToggleRemember}
          className="flex-row items-center"
          accessibilityLabel="记住用户名"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberUsername }}
        >
          <View
            style={[
              styles.checkbox,
              {
                width: size.checkbox,
                height: size.checkbox,
                borderRadius: radius.checkbox,
                borderColor: rememberUsername ? colors.checkboxBorderChecked : colors.checkboxBorder,
                backgroundColor: rememberUsername ? colors.checkboxChecked : 'transparent',
              },
            ]}
          >
            {rememberUsername && (
              <Ionicons name="checkmark" size={size.checkboxIcon} color={colors.icon} />
            )}
          </View>
          <UIText style={[styles.checkboxLabel, { color: colors.text }]}>
            记住用户名
          </UIText>
        </Pressable>
      </HStack>

      {/* 登录按钮：带按压态反馈 */}
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          onSubmit();
        }}
        disabled={isLoading || !isValid}
        style={({ pressed }) => [
          styles.buttonWrap,
          (isLoading || !isValid) && styles.buttonDisabled,
          pressed && !isLoading && isValid && styles.buttonPressed,
        ]}
        accessibilityLabel="登录"
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading || !isValid }}
      >
        <LinearGradient
          colors={[loginTheme.gradient.start, loginTheme.gradient.end]}
          style={[
            styles.loginButton,
            { height: size.inputHeight, borderRadius: radius.button },
            loginTheme.shadowButton,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <UIText style={styles.buttonText}>登录</UIText>
          )}
        </LinearGradient>
      </Pressable>

      {/* 底部链接 */}
      <HStack space="md" className="justify-between mt-4">
        <Pressable
          onPress={onForgotPassword}
          accessibilityLabel="忘记密码"
          accessibilityRole="link"
        >
          <UIText style={[styles.link, { color: colors.textSecondary }]}>
            忘记密码？
          </UIText>
        </Pressable>
        <Pressable
          onPress={onRegister}
          accessibilityLabel="注册账号"
          accessibilityRole="link"
        >
          <UIText style={[styles.link, { color: colors.textSecondary }]}>
            注册账号
          </UIText>
        </Pressable>
      </HStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
  },
  inputField: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  checkbox: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonWrap: {
    marginTop: loginTheme.spacing.lg,
    borderRadius: loginTheme.radius.button,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  loginButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
