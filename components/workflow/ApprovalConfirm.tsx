import { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Heading } from '../ui/heading';
import {
  getWkDefinitionDetailsAsync,
  StartActivityAsync,
  updateExecutionPointerAsync,
  verifyCataloguesAsync,
} from '@/api/workflow/instance';
import CondidateTreeList from './CandidateTreeList';
import { WkActivityCreateDto } from '@/types/workflow/instance/processInstance.types';
import { ProcessInstanceInfo } from './ApprovalDetail';
import * as Yup from 'yup';
import ValidationErrorModal from '../Common/ErrorTable';
import { useToast, Toast, ToastDescription } from '@/components/ui/toast';

export default function ApprovalConfirm({
  visible,
  setVisible,
  processInstanceInfo,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  processInstanceInfo: ProcessInstanceInfo;
}) {
  const navigation = useNavigation();
  const [errors, setErrors] =
    useState<Array<{ path?: string; message: string }>>();
  const [visibleErrorModal, setVisibleErrorModal] = useState<boolean>(false);
  const [isInvalidAuditComments, setIsInvalidAuditComments] = useState(false);
  const [isInvalidSelectReceiver, setIsInvalidSelectReceiver] = useState(false);
  const [formData, setFormData] = useState<WkActivityCreateDto>({
    activityName: '',
    workflowId: '',
    data: {
      DecideBranching: '',
      Remark: '',
      Candidates: '',
      ExecutionType: 1,
    },
  });
  const toast = useToast();
  const [toastId, setToastId] = useState<string>('0');
  const listRef = useRef<{ scrollToOffset: (p: { offset: number; animated?: boolean }) => void } | null>(null);
  const handleToast = (message: string) => {
    if (!toast.isActive(toastId)) {
      showNewToast(message);
    }
  };
  const showNewToast = (message: string) => {
    const newId = Math.random().toString();
    setToastId(newId);
    toast.show({
      id: newId,
      placement: 'top',
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = 'toast-' + id;
        return (
          <Toast nativeID={uniqueToastId} action="warning" variant="solid">
            <ToastDescription>{message}</ToastDescription>
          </Toast>
        );
      },
    });
  };
  const ValidationSchema = Yup.object().shape({
    activityName: Yup.string().required('节点Id缺失'),
    workflowId: Yup.string().required('流程Id缺失'),
    data: Yup.object({
      DecideBranching: Yup.string().required('下一节点名称缺失'),
      ExecutionType: Yup.string().required('下一节点类型缺失'),
    }),
  });

  async function validateAsync(
    data: unknown,
  ): Promise<{ data?: any; error?: any }> {
    try {
      const validatedData = await ValidationSchema.validate(data, {
        abortEarly: false,
      });
      console.log('验证通过:', validatedData);
      return { data: validatedData };
    } catch (err) {
      console.error('验证错误:', err);
      return { error: err };
    }
  }
  useEffect(() => {
    const fetchDefinitionInfo = async () => {
      if (!processInstanceInfo) return;
      try {
        const definitionD = await getWkDefinitionDetailsAsync({
          id: processInstanceInfo.definitionId,
          version: processInstanceInfo.version,
        });
        
        // 安全检查：确保 data 和 nodes 存在
        const definition = definitionD.data || definitionD;
        if (!definition || !definition.nodes || !Array.isArray(definition.nodes)) {
          console.warn('流程定义数据格式不正确或 nodes 不存在');
          return;
        }
        
        const currentNode = definition.nodes.find(
          (d) => d.name === processInstanceInfo.currentStepName,
        );
        console.log(currentNode);
        
        if (currentNode && currentNode.nextNodes && Array.isArray(currentNode.nextNodes)) {
          const nextStep = currentNode.nextNodes.find((n) => n.nodeType === 1);
          if (nextStep)
            setFormData((pre) => ({
              activityName: processInstanceInfo.currentPointerId,
              workflowId: processInstanceInfo.wkInstanceKey,
              data: { ...pre.data, DecideBranching: nextStep.nextNodeName },
            }));
        }
      } catch (error) {
        console.error('获取流程定义信息失败:', error);
      }
    };
    fetchDefinitionInfo();
  }, [processInstanceInfo]);
  /** 仅当下一节点已确定、填写审批意见且已选择接收人时可点击确认通过 */
  const canSubmit =
    Boolean(formData.data.DecideBranching?.trim()) &&
    Boolean(formData.data.Remark?.trim()) &&
    Boolean(formData.data.Candidates?.trim());

  // const verifyAttachment = async () => {
  //   //验证附件是否上传
  //   const catalogueResult = await verifyCataloguesAsync(
  //     [{ reference: processInstanceInfo.reference, referenceType: 1 }],
  //     { details: false },
  //   );
  //   if (catalogueResult && catalogueResult?.profileInfo.length > 0) {
  //     let meg = '';
  //     catalogueResult.profileInfo.forEach((ret) => {
  //       meg += `${ret.message}`;
  //     });
  //     console.log(meg);
  //     handleToast(`请上传必填附件！`);
  //     return true;
  //   }
  //   return false;
  // };
  const handleSubmit = async () => {
    try {
      // if (await verifyAttachment()) return;
      const { error } = await validateAsync(formData);
      if (error) {
        if (error instanceof Yup.ValidationError) {
          const m = error.inner.map((e) => ({
            path: e.path,
            message: e.message,
          }));
          setVisibleErrorModal(true);
          setErrors(m);
        } else {
          handleToast('发生未知错误！');
        }
        return;
      }
      if (!formData.data.Remark) {
        setIsInvalidAuditComments(true);
        return;
      } else {
        setIsInvalidAuditComments(false);
      }
      if (!formData.data.Candidates) {
        setIsInvalidSelectReceiver(true);
        return;
      } else {
        setIsInvalidSelectReceiver(false);
      }
      if (!formData.data.DecideBranching?.trim()) {
        handleToast('无法确定下一节点，请关闭审批窗口后重新打开再试');
        return;
      }
      if (processInstanceInfo.form_data) {
        await updateExecutionPointerAsync(
          { executionPointerId: processInstanceInfo.currentPointerId },
          { form_data: processInstanceInfo.form_data },
        );
      }
      const submitDebug = {
        activityName: formData.activityName,
        workflowId: formData.workflowId,
        data: {
          DecideBranching: formData.data.DecideBranching,
          ExecutionType: formData.data.ExecutionType,
          Candidates: formData.data.Candidates,
          RemarkLength: formData.data.Remark?.length ?? 0,
          RemarkPreview: (formData.data.Remark ?? '').slice(0, 50),
        },
        processInstanceInfo: {
          wkInstanceKey: processInstanceInfo.wkInstanceKey,
          currentPointerId: processInstanceInfo.currentPointerId,
          currentStepName: processInstanceInfo.currentStepName,
          definitionId: processInstanceInfo.definitionId,
          version: processInstanceInfo.version,
        },
      };
      console.log(
        '[ApprovalConfirm] StartActivity payload',
        JSON.stringify(submitDebug, null, 2),
      );

      const res = await StartActivityAsync(formData);
      console.log('[ApprovalConfirm] StartActivity response', {
        status: res?.status,
        data: res?.data,
      });
      setVisible(false);
      navigation.goBack();
      Alert.alert('提交成功', '审批已通过');
    } catch (error: any) {
      const res = error?.response;
      const status = res?.status;
      const body = res?.data;
      // 便于排查 400：打印完整请求体与响应体
      if (status === 400) {
        console.warn('[ApprovalConfirm] StartActivity 400', {
          requestBody: {
            activityName: formData.activityName,
            workflowId: formData.workflowId,
            data: formData.data,
          },
          responseBody: body != null
            ? typeof body === 'string'
              ? body || '(空字符串)'
              : JSON.stringify(body)
            : '(无)',
        });
      } else {
        console.log('[ApprovalConfirm] StartActivity error', {
          status: status,
          data: body,
          message: error?.message,
        });
      }
      // 拦截器已展示“请求错误”文案，此处仅对无 response 的网络错误补充提示
      if (!error?.response) {
        Alert.alert('提交失败', '请检查网络后重试');
      }
    }
  };
  return (
    <>
      <BottomSheetModal
        visible={visible}
        onClose={() => setVisible(false)}
        heightRatio={0.78}
      >
        <View style={styles.sheetHeader}>
          <Heading size="md">审批</Heading>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Keyboard.dismiss();
              setVisible(false);
            }}
            hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
            activeOpacity={0.7}
          >
            <AntDesign name="close" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        {/* 审批意见放在列表头部，键盘弹出时随 FlatList 滚动保持可见 */}
        <View style={styles.content}>
          <View style={[styles.card, styles.candidateCard]}>
            <CondidateTreeList
              ref={listRef}
              wkInstanceKey={processInstanceInfo.wkInstanceKey}
              onSlectKeys={(keys) => {
                if (keys.length > 0)
                  setFormData({
                    ...formData,
                    data: { ...formData.data, Candidates: keys.join(',') },
                  });
              }}
              ListHeaderComponent={
                <View style={styles.commentCard}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="请输入审批意见（必填）"
                    multiline
                    numberOfLines={4}
                    value={formData.data.Remark}
                    onChangeText={(text) =>
                      setFormData({
                        ...formData,
                        data: { ...formData.data, Remark: text },
                      })
                    }
                    onFocus={() => {
                      requestAnimationFrame(() => {
                        listRef.current?.scrollToOffset({ offset: 0, animated: true });
                      });
                    }}
                  />
                  {isInvalidAuditComments && (
                    <Text style={styles.errorText}>审批意见不能为空</Text>
                  )}
                </View>
              }
            />
            {isInvalidSelectReceiver && (
              <Text style={styles.errorText}>请选择接收人</Text>
            )}
          </View>
        </View>
        <SafeAreaView style={styles.sheetFooter}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={canSubmit ? handleSubmit : undefined}
            activeOpacity={canSubmit ? 0.8 : 1}
            disabled={!canSubmit}
          >
            <AntDesign name="check-circle" size={20} color="#fff" />
            <Text
              style={[
                styles.actionText,
                !canSubmit && styles.actionTextDisabled,
              ]}
            >
              确认通过
            </Text>
          </TouchableOpacity>
          {!canSubmit && (
            <Text style={styles.submitHint}>
              请填写审批意见并选择接收人后再提交（需等待节点加载完成）
            </Text>
          )}
        </SafeAreaView>
      </BottomSheetModal>
      {visibleErrorModal && errors && (
        <ValidationErrorModal
          errors={errors}
          visible={visibleErrorModal}
          onClose={() => setVisibleErrorModal(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
    zIndex: 100,
    elevation: 10,
  },
  content: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    minHeight: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  candidateCard: {
    flex: 1,
    minHeight: 280,
  },
  commentCard: {
    marginBottom: 12,
    paddingBottom: 4,
  },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  sheetFooter: {
    padding: 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e8e8e8',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1890FF',
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#bfbfbf',
    opacity: 0.9,
  },
  actionTextDisabled: {
    opacity: 0.95,
  },
  submitHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#8c8c8c',
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
