import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { getProcessInstanceStateTitle } from '@/utils/workflow';
import { FormSection } from '@/types/workflow/form/form.types';
import { AttachCatalogue } from '@/types/workflow/instance/processInstance.types';
import {
  getInstanceNodesAsync,
  getWkDefinitionDetailsAsync,
} from '@/api/workflow/instance';
import ApprovalConfirm from './ApprovalConfirm';
import RejectConfirm from './RejectConfirm';
import ReadOnlyForm from '@/components/form/ReadOnlyForm';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { FileExplorer } from '@/components/files/FileExplorer';
import { useResponsive } from '@/hooks/useResponsive';

/** 审批流程时间轴单条 */
export type ApprovalTimelineItem = {
  time: string;
  action: string;
  operator: string;
  comment?: string;
};

export interface ProcessInstanceInfo {
  wkInstanceKey: string;
  currentPointerId: string;
  currentStepName: string;
  reference: string;
  definitionId: string;
  version: number;
  processType?: string;
  state?: string;
  form_data?: FormSection[];
}
interface ApprovalDetailsProps {
  procesInstanceInfo?: ProcessInstanceInfo;
  sections: FormSection[];
  /** 附件列表，有则显示「查看附件」按钮 */
  attachments?: AttachCatalogue[];
}

export default function ApprovalDetail({
  procesInstanceInfo,
  sections,
  attachments = [],
}: ApprovalDetailsProps) {
  const { isTablet, horizontalPadding, contentMaxWidthForm } = useResponsive();
  const [approvalConfirmVisible, setApprovalConfirmVisible] =
    useState<boolean>(false);
  const [rejectConfirmVisible, setRejectConfirmVisible] =
    useState<boolean>(false);
  const [attachmentVisible, setAttachmentVisible] = useState(false);
  const [timeline, setTimeline] = useState<ApprovalTimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  /** 当前节点是否存在可回退目标（无则驳回按钮不可用） */
  const [canReject, setCanReject] = useState(false);

  // 根据流程定义计算是否有可驳回的回退节点
  useEffect(() => {
    if (!procesInstanceInfo?.definitionId || !procesInstanceInfo?.currentStepName) {
      setCanReject(false);
      return;
    }
    let cancelled = false;
    getWkDefinitionDetailsAsync({
      id: procesInstanceInfo.definitionId,
      version: procesInstanceInfo.version ?? 1,
    })
      .then((res) => {
        if (cancelled) return;
        const definition = res.data || res;
        if (!definition?.nodes || !Array.isArray(definition.nodes)) {
          setCanReject(false);
          return;
        }
        const currentNode = definition.nodes.find(
          (d: { name: string }) => d.name === procesInstanceInfo?.currentStepName,
        );
        if (!currentNode?.nextNodes?.length) {
          setCanReject(false);
          return;
        }
        const startNode = definition.nodes.find(
          (n: { stepNodeType?: number }) => n.stepNodeType === 1,
        );
        const hasRejectTarget = (currentNode.nextNodes as { nodeType: number; nextNodeName: string }[]).some(
          (next) =>
            next.nodeType === 2 && next.nextNodeName !== startNode?.name,
        );
        setCanReject(hasRejectTarget);
      })
      .catch(() => {
        if (!cancelled) setCanReject(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    procesInstanceInfo?.definitionId,
    procesInstanceInfo?.version,
    procesInstanceInfo?.currentStepName,
  ]);

  useEffect(() => {
    if (!procesInstanceInfo?.wkInstanceKey) {
      setTimeline([]);
      return;
    }
    let cancelled = false;
    setTimelineLoading(true);
    getInstanceNodesAsync(procesInstanceInfo.wkInstanceKey)
      .then((nodes) => {
        if (cancelled) return;
        const items: ApprovalTimelineItem[] = nodes.map((node: any) => {
          const rawTime =
            node.submitTime ??
            node.signInTime ??
            node.SubmitTime ??
            node.SignInTime ??
            '';
          const timeStr =
            typeof rawTime === 'string' ? rawTime : String(rawTime ?? '');
          let time = '—';
          if (timeStr) {
            try {
              const d = new Date(timeStr);
              time = isNaN(d.getTime())
                ? String(timeStr)
                : d.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
            } catch {
              time = String(timeStr);
            }
          }
          const action = String(
            node.title ?? node.name ?? node.Title ?? node.Name ?? '—',
          );
          const operator = String(
            node.receiverName ?? node.receiver ?? node.ReceiverName ?? node.Receiver ?? '—',
          );
          return { time, action, operator };
        });
        setTimeline(items);
      })
      .catch(() => {
        if (!cancelled) setTimeline([]);
      })
      .finally(() => {
        if (!cancelled) setTimelineLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [procesInstanceInfo?.wkInstanceKey]);

  const openApproval = () => {
    if (!procesInstanceInfo) {
      console.warn('流程实例信息未加载完成');
      return;
    }
    setRejectConfirmVisible(false);
    setAttachmentVisible(false);
    setApprovalConfirmVisible(true);
  };

  const openReject = () => {
    if (!procesInstanceInfo) {
      console.warn('流程实例信息未加载完成');
      return;
    }
    setApprovalConfirmVisible(false);
    setAttachmentVisible(false);
    setRejectConfirmVisible(true);
  };

  const openAttachment = () => {
    setApprovalConfirmVisible(false);
    setRejectConfirmVisible(false);
    setAttachmentVisible(true);
  };

  /** 规范化 sections，保证 title/description/label 为字符串，避免子组件渲染时报错 */
  const normalizedSections = React.useMemo(() => {
    if (!sections?.length) return [];
    return sections.map((s) => ({
      ...s,
      title: s?.title != null ? String(s.title) : '',
      description:
        s?.description != null && s.description !== ''
          ? String(s.description)
          : undefined,
      fields: (s?.fields ?? []).map((f: any) => ({
        ...f,
        label: f?.label != null ? String(f.label) : '',
      })),
    }));
  }, [sections]);

  const contentContainerStyle: ViewStyle[] = [
    styles.contentContainer,
    { paddingHorizontal: horizontalPadding },
  ];
  if (isTablet) {
    contentContainerStyle.push({
      maxWidth: contentMaxWidthForm,
      alignSelf: 'center',
      width: '100%',
    } as ViewStyle);
  }

  return (
    <View style={styles.page}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerRow}>
          <Header
            title={procesInstanceInfo?.processType}
            status={getProcessInstanceStateTitle(procesInstanceInfo?.state)}
          />
        </View>
      </SafeAreaView>
      {/* 右侧竖排「查看附件」按钮，平板时略增大触控区 */}
      <TouchableOpacity
        style={[styles.verticalAttachmentButton, isTablet && styles.verticalAttachmentButtonTablet]}
        onPress={openAttachment}
        activeOpacity={0.8}
        accessibilityLabel="查看附件"
      >
        <View style={styles.verticalAttachmentContent}>
          <Text style={[styles.verticalAttachmentText, isTablet && styles.verticalAttachmentTextTablet]}>查</Text>
          <Text style={[styles.verticalAttachmentText, isTablet && styles.verticalAttachmentTextTablet]}>看</Text>
          <Text style={[styles.verticalAttachmentText, isTablet && styles.verticalAttachmentTextTablet]}>附</Text>
          <Text style={[styles.verticalAttachmentText, isTablet && styles.verticalAttachmentTextTablet]}>件</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        style={styles.content}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formWrapper}>
          <ReadOnlyForm sections={normalizedSections} />
        </View>
        <View style={[styles.card, isTablet && styles.cardTablet]}>
          <Text style={styles.sectionTitle}>审批流程</Text>
          {timelineLoading ? (
            <Text style={styles.timelineHint}>加载中...</Text>
          ) : timeline.length === 0 ? (
            <Text style={styles.timelineHint}>暂无审批记录</Text>
          ) : (
            timeline.map((step, index) => (
              <TimelineStep
                key={index}
                isLast={index === timeline.length - 1}
                {...step}
              />
            ))
          )}
        </View>
      </ScrollView>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={[styles.footer, isTablet && styles.footerTablet]}>
          <ActionButton
            icon="check-circle"
            label="通过"
            color="#1890FF"
            onPress={openApproval}
          />
          <ActionButton
            icon="close-circle"
            label="驳回"
            color="#FF4D4F"
            onPress={openReject}
            disabled={!canReject}
          />
        </View>
      </SafeAreaView>

      {procesInstanceInfo && (
        <>
          <ApprovalConfirm
            setVisible={setApprovalConfirmVisible}
            visible={approvalConfirmVisible}
            processInstanceInfo={procesInstanceInfo}
          />
          <RejectConfirm
            setVisible={setRejectConfirmVisible}
            visible={rejectConfirmVisible}
            processInstanceInfo={procesInstanceInfo}
          />
        </>
      )}

      <BottomSheetModal
        visible={attachmentVisible}
        onClose={() => setAttachmentVisible(false)}
        heightRatio={0.75}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>查看附件</Text>
          <TouchableOpacity
            style={styles.sheetCloseButton}
            onPress={() => setAttachmentVisible(false)}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.sheetBody}>
          <FileExplorer data={attachments} />
        </View>
      </BottomSheetModal>
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
      <Text style={styles.title}>{title != null ? String(title) : ''}</Text>
      <View
        style={[styles.statusTag, status === '审批中' && styles.pendingTag]}
      >
        <Text style={styles.statusText}>
          {status != null ? String(status) : ''}
        </Text>
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

// 时间轴组件（确保所有展示内容均为字符串，避免 RN 报错）
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
      <Text style={styles.timelineTime}>{String(time)}</Text>
      <Text style={styles.timelineAction}>
        {String(operator)} {String(action)}
      </Text>
      {comment != null && comment !== '' && (
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>{String(comment)}</Text>
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
  disabled = false,
}: {
  icon: any;
  label: string;
  color: string | undefined;
  onPress: () => void;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
    activeOpacity={0.8}
    onPress={disabled ? undefined : onPress}
    disabled={disabled}
  >
    <AntDesign name={icon} size={24} color={color} />
    <Text style={[styles.actionLabel, { color }]}>{label}</Text>
  </TouchableOpacity>
);

// 样式表
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
  },
  verticalAttachmentButton: {
    position: 'absolute',
    right: 0,
    top: 88,
    zIndex: 999,
    elevation: 8,
    backgroundColor: '#1890ff',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: 'rgba(24, 144, 255, 0.35)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  verticalAttachmentButtonTablet: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  verticalAttachmentContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalAttachmentText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  verticalAttachmentTextTablet: {
    fontSize: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sheetCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  sheetBody: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 0,
    backgroundColor: 'transparent',
  },
  backButton: {
    paddingRight: 12,
    marginRight: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleLine: {
    width: 3,
    height: 14,
    backgroundColor: '#1890ff',
    borderRadius: 2,
    marginRight: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  container: {
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 12,
  },
  formWrapper: {
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTablet: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailText: {
    flex: 1,
    marginLeft: 10,
  },
  detailTitle: {
    color: '#999',
    fontSize: 13,
    marginBottom: 2,
  },
  detailValue: {
    color: '#333',
    fontSize: 15,
  },
  amountText: {
    color: '#FF6A6A',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  timelineHint: {
    fontSize: 13,
    color: '#8c8c8c',
    paddingVertical: 8,
  },
  timelineContainer: {
    flexDirection: 'row',
    marginLeft: 7,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1890ff',
    borderWidth: 2,
    borderColor: '#1890ff30',
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 14,
    bottom: -16,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 14,
  },
  timelineTime: {
    color: '#999',
    fontSize: 11,
    marginBottom: 2,
  },
  timelineAction: {
    color: '#333',
    fontSize: 13,
    marginBottom: 4,
  },
  commentBox: {
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 4,
  },
  commentText: {
    color: '#666',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  footerTablet: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionLabel: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
});
