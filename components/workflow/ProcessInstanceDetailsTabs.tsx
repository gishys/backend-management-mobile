import { Link, Tabs } from 'expo-router';
import React from 'react';
import Colors from '@/constants/Colors';
import { Pressable, useColorScheme } from 'react-native';
import { AntDesign, FontAwesome, MaterialIcons } from '@expo/vector-icons';

const ProcessInstanceDetailsTabs: React.FC = () => {
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
            <Link href="/modal" asChild>
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
};

export default ProcessInstanceDetailsTabs;
