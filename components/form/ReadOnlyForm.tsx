import { FormField, FormSection } from '@/types/workflow/form/form.types';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// 启用布局动画
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const ReadOnlyForm = ({
  sections,
  dictionary,
}: {
  sections: FormSection[];
  dictionary?: Record<string, string>;
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // 处理分组展开
  const toggleGroup = (fieldId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(fieldId) ? next.delete(fieldId) : next.add(fieldId);
      return next;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {/* 分组头部 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.description && (
              <Text style={styles.sectionDescription}>
                {section.description}
              </Text>
            )}
          </View>

          {/* 字段列表 */}
          {section.fields.map((field, fieldIndex) => (
            <FieldRow
              key={field.id}
              field={field}
              isLast={fieldIndex === section.fields.length - 1}
              isExpanded={expandedGroups.has(field.id)}
              onPress={
                field.type === 'group' ? () => toggleGroup(field.id) : undefined
              }
              dictionary={dictionary}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

// 字段行组件
const FieldRow = ({
  field,
  isLast,
  isExpanded,
  onPress,
  dictionary,
}: {
  field: FormField;
  isLast: boolean;
  isExpanded?: boolean;
  onPress?: () => void;
  dictionary?: Record<string, string>;
}) => {
  const WrapperComponent = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.fieldOuter}>
      <WrapperComponent
        style={[
          styles.fieldContainer,
          !isLast && styles.fieldBorder,
          onPress && styles.clickableField,
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* 标签部分 */}
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {field.label}
            {field.required && <Text style={styles.requiredMark}> *</Text>}
          </Text>
        </View>

        {/* 值显示部分 */}
        <View style={styles.valueContainer}>
          {field.type === 'badge' ? (
            <View
              style={[
                styles.badge,
                { backgroundColor: field.badgeColor || '#1890ff' },
              ]}
            >
              <Text style={styles.badgeText}>{field.value}</Text>
            </View>
          ) : (
            <Text
              style={[
                styles.value,
                field.type === 'multiline' && styles.multilineValue,
              ]}
              numberOfLines={field.type === 'multiline' ? undefined : 1}
            >
              {formatFieldValue(field, dictionary)}
            </Text>
          )}

          {field.type === 'group' && (
            <Text style={styles.groupIndicator}>{isExpanded ? '▲' : '▼'}</Text>
          )}
        </View>
      </WrapperComponent>

      {/* 子字段 */}
      {field.type === 'group' && isExpanded && (
        <View style={styles.subFieldsContainer}>
          {field.subFields?.map((subField, subIndex) => (
            <FieldRow
              key={subField.id}
              field={subField}
              isLast={subIndex === (field.subFields?.length || 0) - 1}
              dictionary={dictionary}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// 增强的格式化函数
const formatFieldValue = (
  field: FormField,
  dictionary?: Record<string, string>,
) => {
  // 处理字典翻译
  if (field.type === 'select' && field.valueOptions) {
    return field.valueOptions[field.value.toString()] || field.value;
  }

  // 日期格式化
  if (field.type === 'date' && typeof field.value === 'string') {
    return new Date(field.value).toLocaleDateString('zh-CN');
  }

  // 字典回退
  if (dictionary && dictionary[field.value.toString()]) {
    return dictionary[field.value.toString()];
  }

  return field.value.toString();
};

// 样式表增强
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 8,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    // 阴影增强
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  fieldOuter: {
    marginHorizontal: 16,
  },
  fieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: 12,
  },
  clickableField: {
    paddingRight: 8,
  },
  fieldBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  requiredMark: {
    color: '#ff4d4f',
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    lineHeight: 22,
  },
  multilineValue: {
    textAlign: 'left',
    paddingVertical: 8,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 60,
  },
  badgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  groupIndicator: {
    color: '#999',
    fontSize: 12,
    marginLeft: 8,
  },
  subFieldsContainer: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
  },
});

export default ReadOnlyForm;
