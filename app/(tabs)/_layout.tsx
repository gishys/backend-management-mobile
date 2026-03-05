import React, { useMemo, useCallback } from 'react';
import { Tabs, Link } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/hooks/useResponsive';

/**
 * 标签页配置类型
 */
type TabConfig = {
  name: string;
  title: string;
  icon: {
    family: 'AntDesign' | 'MaterialIcons' | 'FontAwesome';
    name: string;
  };
  headerRight?: (props: {
    tintColor?: string;
    pressColor?: string;
    pressOpacity?: number;
    canGoBack: boolean;
  }) => React.ReactNode;
  headerShown?: boolean;
};

/**
 * 标签页配置数组
 */
const TAB_CONFIGS: TabConfig[] = [
  {
    name: 'approve',
    title: '在线审批',
    icon: {
      family: 'MaterialIcons',
      name: 'approval',
    },
    headerShown: true,
  },
  {
    name: 'applicationCenter',
    title: '应用中心',
    icon: {
      family: 'AntDesign',
      name: 'appstore',
    },
    headerShown: true,
  },
  {
    name: 'mine',
    title: '我的',
    icon: {
      family: 'FontAwesome',
      name: 'user',
    },
    headerShown: true,
  },
];

/**
 * 根据图标族返回对应的图标组件
 */
const getIconComponent = (
  family: TabConfig['icon']['family'],
  name: string,
  color: string,
  size: number = 24,
) => {
  const iconProps = { name: name as any, size, color };
  switch (family) {
    case 'AntDesign':
      return <AntDesign {...iconProps} />;
    case 'MaterialIcons':
      return <MaterialIcons {...iconProps} />;
    case 'FontAwesome':
      return <FontAwesome {...iconProps} />;
    default:
      return null;
  }
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isTablet } = useResponsive();

  // 平板：标签栏更高、字体略大，便于触控与阅读
  const tabBarHeight = isTablet ? (Platform.OS === 'ios' ? 72 : 64) : (Platform.OS === 'ios' ? 88 : 60);
  const tabBarPaddingBottom = Platform.OS === 'ios' ? (isTablet ? 20 : 28) : 8;
  const headerTitleFontSize = isTablet ? 20 : 18;

  // 在线审批页面的 headerRight - 使用 useCallback 避免重新创建
  const ApproveHeaderRight = useCallback(
    (props: {
      tintColor?: string;
      pressColor?: string;
      pressOpacity?: number;
      canGoBack: boolean;
    }) => (
      <Link href="/approvaldetails" asChild>
        <Pressable>
          {({ pressed }) => (
            <FontAwesome
              name="info-circle"
              size={25}
              color={props.tintColor || colors.text}
              style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>
      </Link>
    ),
    [colors.text],
  );

  // 使用 useMemo 缓存 screenOptions，避免每次渲染都重新创建
  const screenOptions = useMemo(
    () => ({
      // Tab Bar 样式
      tabBarActiveTintColor: colors.tint,
      tabBarInactiveTintColor: colors.tabIconDefault,
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
        borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
        height: tabBarHeight,
        paddingBottom: tabBarPaddingBottom,
        paddingTop: isTablet ? 12 : 8,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      tabBarLabelStyle: {
        fontSize: isTablet ? 13 : 12,
        fontWeight: '500' as const,
        marginTop: 4,
      },
      tabBarIconStyle: {
        marginTop: 4,
      },
      // Header 样式
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.background,
        elevation: 0, // Android
        shadowOpacity: 0, // iOS
        borderBottomWidth: 1,
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
      },
      headerTintColor: colors.text,
      headerTitleStyle: {
        fontSize: headerTitleFontSize,
        fontWeight: '600' as const,
      },
      headerShadowVisible: false,
      // 可访问性
      tabBarAccessibilityLabel: '标签栏',
      tabBarItemStyle: {
        paddingVertical: 4,
      },
    }),
    [colors, colorScheme, isTablet, tabBarHeight, tabBarPaddingBottom, headerTitleFontSize],
  );

  // 使用 useMemo 缓存标签页配置，避免每次渲染都重新创建
  const tabScreens = useMemo(
    () =>
      TAB_CONFIGS.map((tab) => {
        // 为特定页面添加 headerRight
        const headerRight = tab.name === 'approve' ? ApproveHeaderRight : tab.headerRight;

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              headerShown: tab.headerShown ?? true,
              tabBarIcon: ({ color, focused }) =>
                getIconComponent(
                  tab.icon.family,
                  tab.icon.name,
                  focused ? colors.tint : colors.tabIconDefault,
                  24,
                ),
              tabBarLabel: tab.title,
              tabBarAccessibilityLabel: `${tab.title}标签`,
              headerRight,
            }}
          />
        );
      }),
    [colors.tint, colors.tabIconDefault, ApproveHeaderRight],
  );

  return <Tabs screenOptions={screenOptions}>{tabScreens}</Tabs>;
}
