import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { AntDesign } from '@expo/vector-icons';
import { statsTheme } from './statsTheme';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: keyof typeof AntDesign.glyphMap;
  iconColor?: string;
}

export function SectionHeader({
  title,
  description,
  icon = 'appstore',
  iconColor = statsTheme.colors.primary,
}: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <HStack space="md" className="items-center">
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
          <AntDesign name={icon} size={22} color={iconColor} />
        </View>
        <VStack space="xs" className="flex-1">
          <Heading size="lg" className="text-typography-900 font-bold">
            {title}
          </Heading>
          {description ? (
            <Text style={styles.desc}>{description}</Text>
          ) : null}
        </VStack>
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: statsTheme.spacing.lg,
    paddingBottom: statsTheme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: statsTheme.colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: statsTheme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  desc: {
    fontSize: 12,
    color: statsTheme.colors.text.tertiary,
  },
});
