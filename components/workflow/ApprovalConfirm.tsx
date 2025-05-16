import { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
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
  verifyCataloguesAsync,
} from '@/api/workflow/instance';
import CondidateTreeList from './CandidateTreeList';
import { WkActivityCreateDto } from '@/types/workflow/instance/processInstance.types';
import { ProcessInstanceInfo } from './ApprovalDetail';
import * as Yup from 'yup';
import ValidationErrorModal from '../Common/ErrorTable';

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

  const ValidationSchema = Yup.object().shape({
    activityName: Yup.string().required('节点Id缺失'),
    workflowId: Yup.string().required('流程Id缺失'),
    data: Yup.object({
      DecideBranching: Yup.string().required('下一节点名称缺失'),
      Remark: Yup.string().required('请填写审核意见'),
      Candidates: Yup.string().required('请选择接收人'),
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
      const definitionD = await getWkDefinitionDetailsAsync({
        id: processInstanceInfo.definitionId,
        version: 1,
      });
      const currentNode = definitionD.data?.nodes.find(
        (d) => d.name === processInstanceInfo.currentStepName,
      );
      console.log(currentNode);
      if (currentNode) {
        const nextStep = currentNode.nextNodes.find((n) => n.nodeType === 1);
        if (nextStep)
          setFormData((pre) => ({
            activityName: processInstanceInfo.currentPointerId,
            workflowId: processInstanceInfo.wkInstanceKey,
            data: { ...pre.data, DecideBranching: nextStep.nextNodeName },
          }));
      }
    };
    fetchDefinitionInfo();
  }, [processInstanceInfo]);
  const verifyAttachment = async () => {
    //验证附件是否上传
    const catalogueResult = await verifyCataloguesAsync(
      [{ reference: processInstanceInfo.reference, referenceType: 1 }],
      { details: false },
    );
    if (catalogueResult && catalogueResult?.profileInfo.length > 0) {
      let meg = '';
      catalogueResult.profileInfo.forEach((ret) => {
        meg += `${ret.message}`;
      });
      console.log(meg);
      Alert.alert(`请上传必填附件！`);
      return true;
    }
    return false;
  };
  const handleSubmit = async () => {
    try {
      if (await verifyAttachment()) return;
      const { error } = await validateAsync(formData);
      if (error) {
        if (error instanceof Yup.ValidationError) {
          if (error instanceof Yup.ValidationError) {
            const m = error.inner.map((e) => ({
              path: e.path,
              message: e.message,
            }));
            setVisibleErrorModal(true);
            setErrors(m);
          }
        } else {
          Alert.alert('错误', '发生未知错误！');
        }
        return;
      }
      await StartActivityAsync(formData);
      // 调用审批API
      console.log('提交审批数据:', formData);
      navigation.goBack();
      Alert.alert('提交成功', '审批已通过');
    } catch (error) {
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
              <Heading size="md">审批</Heading>
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
          <View style={styles.content}>
            {/* 审批意见卡片 */}
            <View style={styles.card}>
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
              />
            </View>
            {/* 流程设置卡片 */}
            <View style={{ ...styles.card, height: 342 }}>
              <CondidateTreeList
                wkInstanceKey={processInstanceInfo.wkInstanceKey}
                onSlectKeys={(keys) => {
                  if (keys.length > 0)
                    setFormData({
                      ...formData,
                      data: { ...formData.data, Candidates: keys.join(',') },
                    });
                }}
              />
            </View>
          </View>
          {/* 底部操作栏 */}
          <SafeAreaView style={{ backgroundColor: '#fff' }}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <AntDesign name="checkcircle" size={20} color="#fff" />
                <Text style={styles.actionText}>确认通过</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 16,
  },
  commentInput: {
    height: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    padding: 12,
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
    backgroundColor: '#1890FF',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  submitButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 9999,
  },
});
