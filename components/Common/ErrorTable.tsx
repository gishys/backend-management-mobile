import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// 错误表格组件（复用优化版）
const ErrorTable = ({
  errors,
}: {
  errors: Array<{ path?: string; message: string }>;
}) => (
  <ScrollView horizontal style={styles.tableContainer}>
    <View style={styles.table}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.headerText, styles.pathColumn]}>
          字段
        </Text>
        <Text style={[styles.cell, styles.headerText, styles.messageColumn]}>
          错误描述
        </Text>
      </View>
      {errors.map((error, index) => (
        <View
          key={index}
          style={[styles.row, index % 2 === 0 && styles.evenRow]}
        >
          <Text style={[styles.cell, styles.pathColumn, styles.pathText]}>
            {error.path ? formatPath(error.path) : '-'}
          </Text>
          <Text style={[styles.cell, styles.messageColumn]}>
            {error.message}
          </Text>
        </View>
      ))}
    </View>
  </ScrollView>
);
// 辅助函数：格式化路径显示
const formatPath = (path: string) => {
  return path
    .replace(/([a-z])([A-Z])/g, '$1 $2') // 驼峰转空格
    .replace(/\./g, ' → ') // 点号转箭头
    .replace(/_/g, ' ')
    .toLowerCase();
};

// 现代风格错误模态框
const ValidationErrorModal = ({
  visible,
  errors,
  onClose,
}: {
  visible: boolean;
  errors: Array<{ path?: string; message: string }>;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} style={styles.modal}>
      <View style={styles.modalContent}>
        {/* 模态框头部 */}
        <View style={styles.modalHeader}>
          <AntDesign name="exclamationcircle" size={24} color="#EF4444" />
          <Text style={styles.modalTitle}>表单验证失败</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <AntDesign name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 错误内容 */}
        <Text style={styles.summaryText}>
          发现 {errors.length} 处需要修正的问题：
        </Text>

        <ErrorTable errors={errors} />

        {/* 操作按钮 */}
        <TouchableOpacity
          onPress={onClose}
          style={styles.confirmButton}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>确认并修改</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// 样式表
const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  summaryText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
  },
  tableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  table: {
    minWidth: '100%',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    minHeight: 48,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  cell: {
    paddingVertical: 12,
  },
  headerText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  pathColumn: {
    width: 120,
    marginRight: 24,
  },
  messageColumn: {
    flex: 1,
    minWidth: 200,
  },
  pathText: {
    color: '#3B82F6',
    fontWeight: '500',
    fontSize: 13,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ValidationErrorModal;
