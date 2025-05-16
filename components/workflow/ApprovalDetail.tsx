import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { getProcessInstanceStateTitle } from '@/utils/workflow';
import { FormSection } from '@/types/workflow/form/form.types';
import ApprovalConfirm from './ApprovalConfirm';

// 模拟审批数据
const approvalData = {
  timeline: [
    { time: '2023-08-15 09:30', action: '提交申请', operator: '张三' },
    {
      time: '2023-08-15 10:15',
      action: '审批通过',
      operator: '李四',
      comment: '符合报销标准',
    },
  ],
};
export interface ProcessInstanceInfo {
  wkInstanceKey: string;
  currentPointerId: string;
  currentStepName: string;
  reference: string;
  definitionId: string;
  processType?: string;
  state?: string;
}
interface ApprovalDetailsProps {
  procesInstanceInfo?: ProcessInstanceInfo;
  sections: FormSection[];
}

export default function ApprovalDetail({
  procesInstanceInfo,
  sections,
}: ApprovalDetailsProps) {
  const [approvalConfirmVisible, setApprovalConfirmVisible] =
    useState<boolean>(false);
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <SafeAreaView style={styles.container}>
        <Header
          title={procesInstanceInfo?.processType}
          status={getProcessInstanceStateTitle(procesInstanceInfo?.state)}
        />
      </SafeAreaView>
      {/* 内容区域 */}
      <ScrollView style={styles.content}>
        {sections.map((section) => {
          return (
            <Card title={section.title} key={section.id}>
              {section.fields.map((field) => {
                return (
                  <DetailItem
                    icon="info"
                    title={field.label}
                    key={field.id}
                    value={field.value}
                  />
                );
              })}
            </Card>
          );
        })}
        {/* 审批流程时间轴 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>审批流程</Text>
          {approvalData.timeline.map((step, index) => (
            <TimelineStep
              key={index}
              isLast={index === approvalData.timeline.length - 1}
              {...step}
            />
          ))}
        </View>
      </ScrollView>
      <SafeAreaView style={styles.container}>
        {/* 底部操作栏 */}
        <View style={styles.footer}>
          <ActionButton
            icon="checkcircleo"
            label="通过"
            color="#1890FF"
            onPress={() => {
              setApprovalConfirmVisible(true);
            }}
          />
          <ActionButton
            icon="closecircleo"
            label="驳回"
            color="#FF4D4F"
            onPress={() => console.log('驳回')}
          />
          <ActionButton
            icon="swap"
            label="转交"
            color="#808080"
            onPress={() => console.log('转交')}
          />
        </View>
      </SafeAreaView>
      {procesInstanceInfo && (
        <ApprovalConfirm
          setVisible={setApprovalConfirmVisible}
          visible={approvalConfirmVisible}
          processInstanceInfo={procesInstanceInfo}
        />
      )}
    </View>
  );
}
// 带标题的卡片组件
const Card = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.cardTitleLine} />
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);
// 修改头部组件
const Header = ({ title, status }: { title?: string; status?: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <AntDesign
          name="left"
          style={{ paddingLeft: 16 }}
          size={20}
          color="#333"
        />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      <View
        style={[styles.statusTag, status === '审批中' && styles.pendingTag]}
      >
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};
// 详情项组件
const DetailItem = ({
  icon,
  title,
  value,
  valueStyle,
}: {
  icon: any;
  title: string;
  value?: string | number;
  valueStyle?: any;
}) => (
  <View style={styles.detailItem}>
    <AntDesign name={icon} size={18} color="#666" />
    <View style={styles.detailText}>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
    {title === '附件' && (
      <Feather name="chevron-right" size={20} color="#999" />
    )}
  </View>
);

// 时间轴组件
const TimelineStep = ({
  time,
  action,
  operator,
  comment,
  isLast,
}: {
  time: string;
  action: string;
  operator: string;
  comment?: string;
  isLast: boolean;
}) => (
  <View style={styles.timelineContainer}>
    <View style={styles.timelineDot} />
    {!isLast && <View style={styles.timelineLine} />}
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTime}>{time}</Text>
      <Text style={styles.timelineAction}>
        {operator} {action}
      </Text>
      {comment && (
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>{comment}</Text>
        </View>
      )}
    </View>
  </View>
);

// 操作按钮组件
const ActionButton = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string | undefined;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.actionButton]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <AntDesign name={icon} size={24} color={color} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// 样式表
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    paddingRight: 16,
    marginRight: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleLine: {
    width: 3,
    height: 16,
    backgroundColor: '#1890ff',
    borderRadius: 2,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  container: {
    //flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingTag: {
    backgroundColor: '#1890ff10',
  },
  statusText: {
    color: '#1890ff',
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailTitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: '#333',
    fontSize: 16,
  },
  amountText: {
    color: '#FF6A6A',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  timelineContainer: {
    flexDirection: 'row',
    marginLeft: 9, // 对齐时间线圆点
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1890ff',
    borderWidth: 3,
    borderColor: '#1890ff30',
  },
  timelineLine: {
    position: 'absolute',
    left: 8,
    top: 18,
    bottom: -22,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
    paddingBottom: 24,
  },
  timelineTime: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  timelineAction: {
    color: '#333',
    fontSize: 14,
    marginBottom: 8,
  },
  commentBox: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  commentText: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  actionLabel: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
});
