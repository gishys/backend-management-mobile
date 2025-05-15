import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        //headerShown: useClientOnlyValue(false, true),
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="approve"
        options={{
          title: '在线审批',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="approval" size={25} color={color} />
          ),
          headerRight: () => (
            <Link href="/approvaldetails" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="applicationCenter"
        options={{
          title: '应用中心',
          tabBarIcon: ({ color }) => (
            <AntDesign name="appstore-o" size={25} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mine"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={25} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
