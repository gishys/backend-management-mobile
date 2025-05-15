import { useState } from 'react';
import {
  View,
  ScrollView,
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
  DrawerBody,
} from '@/components/ui/drawer';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
} from '@/components/ui/form-control';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Heading } from '../ui/heading';
import { AlertCircleIcon, CloseIcon, Icon } from '../ui/icon';
import { Pressable } from '../ui/pressable';
import { Center } from '../ui/center';
import { Input, InputField } from '../ui/input';

export default function ApprovalConfirm({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) {
  const navigation = useNavigation();
  const [isInvalid, setIsInvalid] = useState(false);
  const [inputValue, setInputValue] = useState('12345');
  const [formData, setFormData] = useState({
    comment: '',
    notifyApplicant: true,
    nextStep: 'finish',
    attachments: [] as string[],
  });

  const handleSubmit = async () => {
    if (!formData.comment.trim()) {
      Alert.alert('提示', '请填写审批意见');
      return;
    }
    try {
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
        <DrawerContent className="p-0" style={{ backgroundColor: '#fff' }}>
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
          <DrawerBody className="p-0" style={{ backgroundColor: '#fff' }}>
            {/* 主要内容 */}
            <ScrollView style={styles.content}>
              {/* 审批意见卡片 */}
              <View style={styles.card}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="请输入审批意见（必填）"
                  multiline
                  numberOfLines={4}
                  value={formData.comment}
                  onChangeText={(text) =>
                    setFormData({ ...formData, comment: text })
                  }
                />
              </View>
              {/* 流程设置卡片 */}
              <View style={styles.card}>
                <FormControl
                  isInvalid={isInvalid}
                  size="md"
                  isDisabled={false}
                  isReadOnly={false}
                  isRequired={false}
                >
                  <FormControlLabel>
                    <FormControlLabelText>Password</FormControlLabelText>
                  </FormControlLabel>
                  <Input className="my-1" size="md">
                    <InputField
                      type="password"
                      placeholder="password"
                      value={inputValue}
                      onChangeText={(text) => setInputValue(text)}
                    />
                  </Input>
                  <FormControlHelper>
                    <FormControlHelperText>
                      Must be atleast 6 characters.
                    </FormControlHelperText>
                  </FormControlHelper>
                  <FormControlError>
                    <FormControlErrorIcon as={AlertCircleIcon} />
                    <FormControlErrorText>
                      Atleast 6 characters are required.
                    </FormControlErrorText>
                  </FormControlError>
                </FormControl>
                <Text style={styles.cardTitle}>流程设置</Text>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() =>
                    setFormData({ ...formData, nextStep: 'finish' })
                  }
                >
                  <AntDesign
                    name={
                      formData.nextStep === 'finish'
                        ? 'checkcircle'
                        : 'checkcircleo'
                    }
                    size={20}
                    color={formData.nextStep === 'finish' ? '#1890FF' : '#666'}
                  />
                  <Text style={styles.optionText}>结束流程</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() =>
                    setFormData({ ...formData, nextStep: 'continue' })
                  }
                >
                  <AntDesign
                    name={
                      formData.nextStep === 'continue'
                        ? 'checkcircle'
                        : 'checkcircleo'
                    }
                    size={20}
                    color={
                      formData.nextStep === 'continue' ? '#1890FF' : '#666'
                    }
                  />
                  <Text style={styles.optionText}>转交下一步审批</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </DrawerBody>
          {/* 底部操作栏 */}
          <SafeAreaView style={{ backgroundColor: '#fff' }}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 12,
                  paddingLeft: 8,
                }}
                onPress={() =>
                  setFormData({
                    ...formData,
                    notifyApplicant: !formData.notifyApplicant,
                  })
                }
              >
                <AntDesign
                  name={
                    formData.notifyApplicant ? 'checkcircle' : 'checkcircleo'
                  }
                  size={20}
                  color={formData.notifyApplicant ? '#1890FF' : '#666'}
                />
                <Text style={styles.optionText}>通知申请人</Text>
              </TouchableOpacity>
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
