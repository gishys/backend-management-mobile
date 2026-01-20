import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Heading } from '../ui/heading';
import { CloseIcon, Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Center } from '../ui/center';
import {
  getWkDefinitionDetailsAsync,
  StartActivityAsync,
  updateExecutionPointerAsync,
} from '@/api/workflow/instance';
import { WkActivityCreateDto } from '@/types/workflow/instance/processInstance.types';
import { ProcessInstanceInfo } from './ApprovalDetail';
import * as Yup from 'yup';
import ValidationErrorModal from '../Common/ErrorTable';
import { useToast, Toast, ToastDescription } from '@/components/ui/toast';

export default function RejectConfirm({
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
  const [isInvalidRejectReason, setIsInvalidRejectReason] = useState(false);
  const [previousNodes, setPreviousNodes] = useState<
    Array<{ nextNodeName: string; nodeType: number }>
  >([]);
  const [selectedPreviousNode, setSelectedPreviousNode] = useState<string>('');
  const [formData, setFormData] = useState<WkActivityCreateDto>({
    activityName: '',
    workflowId: '',
    data: {
      DecideBranching: '',
      Remark: '',
      Candidates: '',
      ExecutionType: 2, // 驳回使用回退类型
    },
  });
  const toast = useToast();
  const [toastId, setToastId] = useState<string>('0');

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
          <Toast nativeID={uniqueToastId} action="error" variant="solid">
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
      DecideBranching: Yup.string().required('回退节点名称缺失'),
      Remark: Yup.string().required('驳回原因不能为空'),
      ExecutionType: Yup.number().required('执行类型缺失'),
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
          version: processInstanceInfo.version || 1,
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
        console.log('当前节点:', currentNode);

        if (currentNode) {
          // 查找所有前序节点（nodeType === 2 表示回退）
          const prevNodes = definition.nodes
            .filter((node) => {
              // 查找指向当前节点的节点（即前序节点）
              return (
                node.nextNodes &&
                Array.isArray(node.nextNodes) &&
                node.nextNodes.some(
                  (next) => next.nextNodeName === processInstanceInfo.currentStepName,
                )
              );
            })
            .map((node) => ({
              nextNodeName: node.name,
              nodeType: 2, // 回退类型
            }));

          setPreviousNodes(prevNodes);

          // 如果有前序节点，默认选择第一个
          if (prevNodes.length > 0) {
            const defaultNode = prevNodes[0].nextNodeName;
            setSelectedPreviousNode(defaultNode);
            setFormData((pre) => ({
              activityName: processInstanceInfo.currentPointerId,
              workflowId: processInstanceInfo.wkInstanceKey,
              data: {
                ...pre.data,
                DecideBranching: defaultNode,
              },
            }));
          } else {
            // 如果没有前序节点，尝试从当前节点的 nextNodes 中找回退节点
            if (
              currentNode.nextNodes &&
              Array.isArray(currentNode.nextNodes)
            ) {
              const backNode = currentNode.nextNodes.find(
                (n) => n.nodeType === 2,
              );
              if (backNode) {
                setSelectedPreviousNode(backNode.nextNodeName);
                setFormData((pre) => ({
                  activityName: processInstanceInfo.currentPointerId,
                  workflowId: processInstanceInfo.wkInstanceKey,
                  data: {
                    ...pre.data,
                    DecideBranching: backNode.nextNodeName,
                  },
                }));
              }
            }
          }
        }
      } catch (error) {
        console.error('获取流程定义信息失败:', error);
      }
    };
    if (visible) {
      fetchDefinitionInfo();
    }
  }, [processInstanceInfo, visible]);

  const handleSubmit = async () => {
    try {
      // 验证驳回原因
      if (!formData.data.Remark || formData.data.Remark.trim() === '') {
        setIsInvalidRejectReason(true);
        handleToast('驳回原因不能为空');
        return;
      } else {
        setIsInvalidRejectReason(false);
      }

      // 验证回退节点
      if (!formData.data.DecideBranching) {
        handleToast('请选择回退节点');
        return;
      }

      // 验证表单数据
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

      // 更新表单数据（如果有）
      if (processInstanceInfo.form_data) {
        await updateExecutionPointerAsync(
          { executionPointerId: processInstanceInfo.currentPointerId },
          { form_data: processInstanceInfo.form_data },
        );
      }

      // 提交驳回请求
      await StartActivityAsync(formData);
      console.log('提交驳回数据:', formData);
      navigation.goBack();
      Alert.alert('提交成功', '流程已驳回');
      setVisible(false);
    } catch (error) {
      console.error('驳回失败:', error);
      Alert.alert('提交失败', '请检查网络后重试');
    }
  };

  return (
    <>
      <Drawer
        isOpen={visible}
        onClose={() => {
          setVisible(false);
        }}
        size="lg"
        anchor="bottom"
      >
        <DrawerBackdrop />
        <DrawerContent
          className="p-0"
          style={{ backgroundColor: '#fff', flex: 1 }}
        >
          <DrawerHeader className="p-3">
            <Center className="w-full">
              <Heading size="md">驳回</Heading>
            </Center>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setVisible(false);
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Icon as={CloseIcon} size="md" color="#000" />
            </Pressable>
          </DrawerHeader>
          {/* 主要内容 */}
          <ScrollView style={styles.content}>
            {/* 驳回原因卡片 */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>驳回原因（必填）</Text>
              <TextInput
                style={[
                  styles.commentInput,
                  isInvalidRejectReason && styles.inputError,
                ]}
                placeholder="请输入驳回原因，说明为什么驳回此流程..."
                multiline
                numberOfLines={6}
                value={formData.data.Remark}
                onChangeText={(text) => {
                  setFormData({
                    ...formData,
                    data: { ...formData.data, Remark: text },
                  });
                  if (text.trim()) {
                    setIsInvalidRejectReason(false);
                  }
                }}
              />
              {isInvalidRejectReason && (
                <Text style={styles.errorText}>驳回原因不能为空</Text>
              )}
            </View>

            {/* 回退节点选择卡片 */}
            {previousNodes.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>回退到节点</Text>
                <Text style={styles.hintText}>
                  请选择要将流程回退到的节点
                </Text>
                {previousNodes.map((node, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.nodeOption,
                      selectedPreviousNode === node.nextNodeName &&
                        styles.nodeOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedPreviousNode(node.nextNodeName);
                      setFormData({
                        ...formData,
                        data: {
                          ...formData.data,
                          DecideBranching: node.nextNodeName,
                        },
                      });
                    }}
                  >
                    <View style={styles.nodeOptionContent}>
                      {selectedPreviousNode === node.nextNodeName ? (
                        <AntDesign
                          name="check-circle"
                          size={20}
                          color="#1890FF"
                        />
                      ) : (
                        <View
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: '#d9d9d9',
                            backgroundColor: 'transparent',
                          }}
                        />
                      )}
                      <Text
                        style={[
                          styles.nodeOptionText,
                          selectedPreviousNode === node.nextNodeName &&
                            styles.nodeOptionTextSelected,
                        ]}
                      >
                        {node.nextNodeName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 提示信息 */}
            <View style={styles.warningCard}>
              <AntDesign name="exclamation-circle" size={20} color="#FF9800" />
              <Text style={styles.warningText}>
                驳回后流程将回退到指定节点，请谨慎操作
              </Text>
            </View>
          </ScrollView>
          {/* 底部操作栏 */}
          <SafeAreaView style={{ backgroundColor: '#fff' }}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <AntDesign name="close-circle" size={20} color="#fff" />
                <Text style={styles.actionText}>确认驳回</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </DrawerContent>
      </Drawer>
      {visibleErrorModal && errors && (
        <ValidationErrorModal
          errors={errors}
          visible={visibleErrorModal}
          onClose={() => {
            setVisibleErrorModal(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  commentInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: '#FF4D4F',
  },
  nodeOption: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  nodeOptionSelected: {
    borderColor: '#1890FF',
    backgroundColor: '#e6f7ff',
  },
  nodeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  nodeOptionTextSelected: {
    color: '#1890FF',
    fontWeight: '500',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7e6',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#FF9800',
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
  },
  rejectButton: {
    backgroundColor: '#FF4D4F',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 9999,
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 12,
    marginTop: 8,
  },
});
