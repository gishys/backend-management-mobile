import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FormField, FormSection } from '@/types/workflow/form/form.types';

interface FormViewerProps {
  sections: FormSection[];
}

// 辅助函数
const formatDate = (value?: string | number) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleDateString('zh-CN');
};

const getOptionLabel = (
  value: string | number,
  options?: Record<string, string>,
) => {
  return options?.[value] || value || '-';
};

// 表单字段组件
const FieldRenderer: React.FC<{ field: FormField }> = ({ field }) => {
  const renderValue = () => {
    if (!field.value && field.value !== 0)
      return <Text style={styles.valueText}>-</Text>;

    switch (field.type) {
      case 'date':
        return <Text style={styles.valueText}>{formatDate(field.value)}</Text>;
      case 'select':
        return (
          <View style={styles.selectContainer}>
            <Text style={styles.valueText}>
              {getOptionLabel(field.value, field.valueOptions)}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
          </View>
        );
      case 'badge':
        return (
          <View
            style={[
              styles.badge,
              { backgroundColor: field.badgeColor || '#1890ff' },
            ]}
          >
            <Text style={styles.badgeText}>{field.value}</Text>
          </View>
        );
      case 'multiline':
        return (
          <Text style={[styles.valueText, styles.multiline]}>
            {field.value}
          </Text>
        );
      case 'group':
        return (
          <View style={styles.groupContainer}>
            {field.subFields?.map((subField) => (
              <FieldRenderer key={subField.id} field={subField} />
            ))}
          </View>
        );
      default:
        return <Text style={styles.valueText}>{field.value}</Text>;
    }
  };

  return (
    <View style={styles.fieldContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>
      {renderValue()}
    </View>
  );
};

// 主组件
const FormViewer: React.FC<FormViewerProps> = ({ sections }) => {
  const sortedSections = [...sections].sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );

  return (
    <ScrollView style={styles.container}>
      {sortedSections.map((section) => (
        <View key={section.id} style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.description && (
              <Text style={styles.sectionDescription}>
                {section.description}
              </Text>
            )}
          </View>

          <View style={styles.sectionBody}>
            {section.fields.map((field) => (
              <FieldRenderer key={field.id} field={field} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// 样式表
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionBody: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 6,
  },
  labelText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  required: {
    color: '#ff4d4f',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  multiline: {
    lineHeight: 22,
    paddingVertical: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  groupContainer: {
    borderLeftWidth: 2,
    borderLeftColor: '#1890ff',
    paddingLeft: 12,
    marginLeft: 8,
  },
});

export default FormViewer;
