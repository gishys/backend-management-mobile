import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FormField, FormSection } from '@/types/workflow/form/form.types';
import { createShadowStyle } from '@/utils/shadowStyles';

interface FormViewerProps {
  sections: FormSection[];
}

// 设计系统颜色常量 - 更丰富的配色方案
const COLORS = {
  background: '#f5f7fa',
  backgroundLight: '#fafbfc',
  cardBackground: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textDisabled: '#cbd5e0',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  accent: '#1890ff',
  accentLight: '#e6f7ff',
  accentGradient: ['#1890ff', '#096dd9'],
  error: '#ff4d4f',
  errorLight: '#fff1f0',
  success: '#52c41a',
  successLight: '#f6ffed',
  warning: '#faad14',
  warningLight: '#fffbe6',
  badgeDefault: '#1890ff',
  badgeGradient: ['#667eea', '#764ba2'],
  groupBorder: '#1890ff',
  groupGradient: ['#e6f7ff', '#f0f9ff'],
  arrayItemBg: '#f8fafc',
  iconBg: '#f0f4f8',
} as const;

// 间距常量
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// 获取字段类型图标和样式配置
const getFieldIconConfig = (type?: string): {
  name: string;
  family: 'MaterialIcons' | 'AntDesign';
  gradient: string[];
  iconColor: string;
  size: number;
} => {
  switch (type) {
    case 'date':
      return {
        name: 'calendar-today',
        family: 'MaterialIcons',
        gradient: ['#ff9a9e', '#fecfef'],
        iconColor: '#c41d7f',
        size: 18,
      };
    case 'select':
      return {
        name: 'list',
        family: 'MaterialIcons',
        gradient: ['#a8edea', '#fed6e3'],
        iconColor: '#00b4d8',
        size: 18,
      };
    case 'badge':
      return {
        name: 'tag',
        family: 'AntDesign',
        gradient: ['#ffecd2', '#fcb69f'],
        iconColor: '#ff6b35',
        size: 18,
      };
    case 'multiline':
      return {
        name: 'text-fields',
        family: 'MaterialIcons',
        gradient: ['#d299c2', '#fef9d7'],
        iconColor: '#9b59b6',
        size: 18,
      };
    case 'group':
      return {
        name: 'folder',
        family: 'AntDesign',
        gradient: ['#89f7fe', '#66a6ff'],
        iconColor: '#0066ff',
        size: 18,
      };
    default:
      return {
        name: 'text-fields',
        family: 'MaterialIcons',
        gradient: ['#e0c3fc', '#8ec5fc'],
        iconColor: '#667eea',
        size: 18,
      };
  }
};

// 辅助函数
const formatDate = (value?: string | number) => {
  if (!value) return '-';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return String(value);
  }
};

const getOptionLabel = (
  value: string | number,
  options?: Record<string, string>,
) => {
  if (value === null || value === undefined) return '-';
  return options?.[String(value)] || String(value) || '-';
};

// 类型守卫：检查是否为有效的 FormField
const isValidFormField = (field: any): field is FormField => {
  return field && typeof field === 'object' && 'id' in field && 'label' in field;
};

// 规范化 subFields：将 FormField | FormField[] | any 转换为 FormField[]
const normalizeSubFields = (subFields?: FormField | FormField[] | any): FormField[] => {
  if (!subFields) return [];
  
  if (Array.isArray(subFields)) {
    return subFields.filter(isValidFormField);
  }
  
  if (isValidFormField(subFields)) {
    return [subFields];
  }
  
  if (typeof subFields === 'object') {
    const possibleFields = Object.values(subFields).flat();
    return possibleFields.filter(isValidFormField);
  }
  
  return [];
};

// 表单字段组件
const FieldRenderer: React.FC<{ field: FormField }> = ({ field }) => {
  const fieldIconConfig = getFieldIconConfig(field.type);
  const IconComponent = fieldIconConfig.family === 'MaterialIcons' ? MaterialIcons : AntDesign;

  const renderValue = () => {
    // 处理数组值
    if (field.isArray && Array.isArray(field.value)) {
      if (field.value.length === 0) {
        return (
          <View style={styles.emptyValueContainer}>
            <Text style={[styles.valueText, styles.emptyValue]}>-</Text>
          </View>
        );
      }
      return (
        <View style={styles.arrayContainer}>
          {field.value.map((item, index) => (
            <View key={index} style={styles.arrayItem}>
              <View style={styles.arrayItemDot} />
              <Text style={styles.arrayItemText}>{String(item)}</Text>
            </View>
          ))}
        </View>
      );
    }

    // 处理空值（但排除数字 0）
    if (field.value === null || field.value === undefined || field.value === '') {
      return (
        <View style={styles.emptyValueContainer}>
          <Text style={[styles.valueText, styles.emptyValue]}>-</Text>
        </View>
      );
    }

    switch (field.type) {
      case 'date':
        return (
          <View style={styles.valueWrapper}>
            <MaterialIcons 
              name="event" 
              size={16} 
              color={COLORS.accent} 
              style={styles.valueIcon}
            />
            <Text style={styles.valueText}>{formatDate(field.value)}</Text>
          </View>
        );
      
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <Text style={styles.valueText} numberOfLines={1}>
              {getOptionLabel(field.value, field.valueOptions)}
            </Text>
            <View style={styles.selectIconContainer}>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={20} 
                color={COLORS.accent} 
              />
            </View>
          </View>
        );
      
      case 'badge':
        return (
          <LinearGradient
            colors={field.badgeColor 
              ? [field.badgeColor, field.badgeColor] 
              : COLORS.badgeGradient
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.badge}
          >
            <AntDesign name="tag" size={12} color="#ffffff" style={styles.badgeIcon} />
            <Text style={styles.badgeText}>{String(field.value)}</Text>
          </LinearGradient>
        );
      
      case 'multiline':
        return (
          <View style={styles.multilineContainer}>
            <View style={styles.multilineIndicator} />
            <Text style={[styles.valueText, styles.multiline]}>
              {String(field.value)}
            </Text>
          </View>
        );
      
      case 'group':
        const normalizedSubFields = normalizeSubFields(field.subFields);
        if (normalizedSubFields.length === 0) {
          return (
            <View style={styles.emptyValueContainer}>
              <Text style={[styles.valueText, styles.emptyValue]}>-</Text>
            </View>
          );
        }
        return (
          <LinearGradient
            colors={COLORS.groupGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.groupContainer}
          >
            <View style={styles.groupHeader}>
              <AntDesign name="folder" size={14} color={COLORS.groupBorder} />
              <Text style={styles.groupHeaderText}>
                包含 {normalizedSubFields.length} 个子字段
              </Text>
            </View>
            <View style={styles.groupContent}>
              {normalizedSubFields.map((subField) => (
                <FieldRenderer key={subField.id} field={subField} />
              ))}
            </View>
          </LinearGradient>
        );
      
      default:
        return (
          <Text style={styles.valueText} numberOfLines={3}>
            {String(field.value)}
          </Text>
        );
    }
  };

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.fieldHeader}>
        <View style={styles.labelContainer}>
          <LinearGradient
            colors={fieldIconConfig.gradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.labelIconContainer}
          >
            <View style={styles.iconInnerContainer}>
              <IconComponent 
                name={fieldIconConfig.name as any} 
                size={fieldIconConfig.size} 
                color={fieldIconConfig.iconColor} 
              />
            </View>
          </LinearGradient>
          <View style={styles.labelTextContainer}>
            <Text style={styles.labelText}>
              {field.label}
              {field.required && (
                <Text style={styles.required}>
                  <AntDesign name="star" size={12} color={COLORS.error} />
                </Text>
              )}
            </Text>
            {field.type && (
              <View style={styles.fieldTypeBadge}>
                <Text style={styles.fieldTypeText}>
                  {field.type === 'date' ? '日期' :
                   field.type === 'select' ? '选择' :
                   field.type === 'badge' ? '标签' :
                   field.type === 'multiline' ? '多行' :
                   field.type === 'group' ? '分组' : '文本'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <View style={styles.valueContainer}>
        {renderValue()}
      </View>
    </View>
  );
};

// 主组件
const FormViewer: React.FC<FormViewerProps> = ({ sections }) => {
  // 使用 useMemo 优化排序性能
  const sortedSections = useMemo(() => {
    if (!sections || sections.length === 0) return [];
    return [...sections].sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }, [sections]);

  // 对每个 section 的字段进行排序
  const sectionsWithSortedFields = useMemo(() => {
    return sortedSections.map((section) => ({
      ...section,
      fields: [...section.fields].sort(
        (a, b) => (a.sort || 0) - (b.sort || 0),
      ),
    }));
  }, [sortedSections]);

  if (!sections || sections.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#e6f7ff', '#f0f9ff']}
          style={styles.emptyIconContainer}
        >
          <MaterialIcons 
            name="description" 
            size={64} 
            color={COLORS.accent} 
          />
        </LinearGradient>
        <Text style={styles.emptyText}>暂无表单数据</Text>
        <Text style={styles.emptySubText}>请稍后再试</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={true}
    >
      {sectionsWithSortedFields.map((section, sectionIndex) => (
        <View key={section.id} style={styles.sectionCard}>
          <LinearGradient
            colors={['#f8fafc', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sectionHeader}
          >
            <View style={styles.sectionHeaderContent}>
              <View style={styles.sectionIconContainer}>
                <MaterialIcons 
                  name="folder-open" 
                  size={20} 
                  color={COLORS.accent} 
                />
              </View>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.description && (
                  <Text style={styles.sectionDescription}>
                    {section.description}
                  </Text>
                )}
              </View>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>
                  {section.fields.length}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.sectionBody}>
            {section.fields.length > 0 ? (
              section.fields.map((field, index) => (
                <View 
                  key={field.id}
                  style={[
                    styles.fieldWrapper,
                    index < section.fields.length - 1 && styles.fieldBorder,
                  ]}
                >
                  <FieldRenderer field={field} />
                </View>
              ))
            ) : (
              <View style={styles.emptyFieldContainer}>
                <MaterialIcons 
                  name="inbox" 
                  size={32} 
                  color={COLORS.textTertiary} 
                  style={styles.emptyFieldIcon}
                />
                <Text style={styles.emptyFieldText}>暂无字段</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// 样式表 - 使用跨平台兼容的样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
      },
    }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
    backgroundColor: COLORS.background,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...createShadowStyle(
      COLORS.accent,
      { width: 0, height: 4 },
      0.15,
      12,
      Platform.OS === 'android' ? 4 : undefined
    ),
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...createShadowStyle(
      '#000',
      { width: 0, height: 4 },
      0.08,
      12,
      Platform.OS === 'android' ? 4 : undefined
    ),
  },
  sectionHeader: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.borderLight,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  sectionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadowStyle(
      COLORS.accent,
      { width: 0, height: 2 },
      0.2,
      4,
      Platform.OS === 'android' ? 2 : undefined
    ),
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionBody: {
    padding: SPACING.lg,
  },
  emptyFieldContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyFieldIcon: {
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyFieldText: {
    fontSize: 14,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  fieldWrapper: {
    paddingVertical: SPACING.md,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderLight,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
  },
  fieldContainer: {
    flex: 1,
  },
  fieldHeader: {
    marginBottom: SPACING.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  labelIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    ...createShadowStyle(
      '#000',
      { width: 0, height: 2 },
      0.1,
      4,
      Platform.OS === 'android' ? 2 : undefined
    ),
  },
  iconInnerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  labelTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginRight: SPACING.xs,
  },
  fieldTypeBadge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  fieldTypeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textTertiary,
    letterSpacing: 0.2,
  },
  required: {
    marginLeft: SPACING.xs,
  },
  valueContainer: {
    minHeight: 24,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueIcon: {
    marginRight: SPACING.xs,
  },
  valueText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
    fontWeight: '400',
  },
  emptyValueContainer: {
    paddingVertical: SPACING.xs,
  },
  emptyValue: {
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  multilineContainer: {
    marginTop: SPACING.xs,
    flexDirection: 'row',
  },
  multilineIndicator: {
    width: 3,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  multiline: {
    lineHeight: 24,
    paddingVertical: SPACING.sm,
    flex: 1,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.sm,
  },
  selectIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    minHeight: 28,
    alignItems: 'center',
    ...createShadowStyle(
      '#000',
      { width: 0, height: 2 },
      0.15,
      4,
      Platform.OS === 'android' ? 2 : undefined
    ),
  },
  badgeIcon: {
    marginRight: SPACING.xs,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  groupContainer: {
    marginTop: SPACING.sm,
    marginLeft: SPACING.sm,
    padding: SPACING.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.groupBorder,
    ...createShadowStyle(
      COLORS.groupBorder,
      { width: 0, height: 2 },
      0.1,
      6,
      Platform.OS === 'android' ? 2 : undefined
    ),
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.groupBorder,
    marginLeft: SPACING.xs,
  },
  groupContent: {
    marginTop: SPACING.xs,
  },
  arrayContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.arrayItemBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  arrayItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.sm,
  },
  arrayItemText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
});

export default FormViewer;
