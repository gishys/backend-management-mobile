import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthProvider';
import RouteGuard from '@/components/Common/RouteGuard';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof AntDesign.glyphMap;
  iconFamily: 'AntDesign' | 'FontAwesome' | 'MaterialIcons';
  onPress: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

export default function MineScreen() {
  const { authState, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 从 token 中解析用户信息（这里假设 token 是 JWT，实际应该从 API 获取）
  // 注意：实际项目中应该从 API 获取用户信息，这里仅作演示
  const userName = '用户'; // 应该从 API 或 token 解析获取
  const userEmail = 'user@example.com'; // 应该从 API 或 token 解析获取

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('退出登录失败:', error);
              Alert.alert('错误', '退出登录失败，请重试');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const menuItems: MenuItem[] = [
    {
      id: 'myprocesses',
      title: '我的办理',
      icon: 'file-text',
      iconFamily: 'AntDesign',
      onPress: () => {
        router.push('/myprocesses');
      },
      showArrow: true,
    },
    {
      id: 'settings',
      title: '设置',
      icon: 'setting',
      iconFamily: 'AntDesign',
      onPress: () => {
        // TODO: 导航到设置页面
        Alert.alert('提示', '设置功能开发中');
      },
      showArrow: true,
    },
    {
      id: 'about',
      title: '关于',
      icon: 'info-circle',
      iconFamily: 'AntDesign',
      onPress: () => {
        Alert.alert(
          '关于',
          `后端管理系统\n版本: ${Constants.expoConfig?.version || '1.0.0'}\n构建: ${Constants.expoConfig?.sdkVersion || 'N/A'}`,
          [{ text: '确定' }],
        );
      },
      showArrow: true,
    },
    {
      id: 'help',
      title: '帮助与反馈',
      icon: 'question-circle',
      iconFamily: 'AntDesign',
      onPress: () => {
        // TODO: 导航到帮助页面
        Alert.alert('提示', '帮助功能开发中');
      },
      showArrow: true,
    },
    {
      id: 'logout',
      title: '退出登录',
      icon: 'logout',
      iconFamily: 'AntDesign',
      onPress: handleLogout,
      showArrow: false,
      danger: true,
    },
  ];

  const getIcon = (iconName: string, iconFamily: string, danger?: boolean) => {
    const iconSize = 20;
    const iconColor = danger ? '#FF4D4F' : '#666';

    switch (iconFamily) {
      case 'AntDesign':
        return <AntDesign name={iconName as any} size={iconSize} color={iconColor} />;
      case 'FontAwesome':
        return <FontAwesome name={iconName as any} size={iconSize} color={iconColor} />;
      case 'MaterialIcons':
        return <MaterialIcons name={iconName as any} size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <RouteGuard>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 用户信息卡片 */}
          <Card className="m-4 p-4 rounded-lg">
            <HStack space="md" className="items-center">
              <Avatar size="lg" className="bg-primary-500">
                <AvatarFallbackText className="text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallbackText>
                {/* 如果有头像图片，可以使用 AvatarImage */}
                {/* <AvatarImage source={{ uri: userAvatar }} /> */}
              </Avatar>
              <VStack space="xs" className="flex-1">
                <Heading size="md">{userName}</Heading>
                <Text className="text-sm text-typography-600">{userEmail}</Text>
              </VStack>
              <TouchableOpacity
                onPress={() => {
                  router.push('/profile');
                }}
                activeOpacity={0.7}
              >
                <AntDesign name="right" size={18} color="#999" />
              </TouchableOpacity>
            </HStack>
          </Card>

          {/* 菜单列表 */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={item.onPress}
                disabled={loading && item.id === 'logout'}
              >
                <Card
                  className={`mx-4 mb-2 p-4 rounded-lg ${
                    item.danger ? 'bg-red-50' : ''
                  }`}
                >
                  <HStack space="md" className="items-center">
                    <View style={styles.iconContainer}>
                      {getIcon(item.icon, item.iconFamily, item.danger)}
                    </View>
                    <Text
                      className={`flex-1 text-base ${
                        item.danger ? 'text-red-600' : 'text-typography-900'
                      }`}
                    >
                      {item.title}
                    </Text>
                    {item.showArrow && (
                      <AntDesign name="right" size={16} color="#999" />
                    )}
                  </HStack>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* 版本信息 */}
          <View style={styles.versionContainer}>
            <Text className="text-xs text-typography-500 text-center">
              版本 {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuContainer: {
    marginTop: 8,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
  },
  versionContainer: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
