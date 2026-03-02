import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text as UIText } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { loginTheme } from '@/constants/loginTheme';

/**
 * 登录页头部：Logo、标题、副标题，带入场动效
 */
export function LoginHeader() {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const { spacing, radius, size, colors } = loginTheme;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            width: size.logo,
            height: size.logo,
            borderRadius: radius.logo,
            marginBottom: spacing.section,
          },
          { transform: [{ scale }], opacity },
        ]}
        accessibilityRole="image"
        accessibilityLabel="应用 Logo"
      >
        <Ionicons name="business" size={size.logoIcon} color={colors.icon} />
      </Animated.View>
      <Heading
        size="2xl"
        className="text-white text-center mb-2"
        style={styles.title}
      >
        欢迎回来
      </Heading>
      <UIText
        className="text-center opacity-90"
        style={[styles.subtitle, { color: colors.textSecondary }]}
      >
        请登录您的账号
      </UIText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  logoWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
});
