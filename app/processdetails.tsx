import {
  fetchAttachmentByReferenceAsync,
  fetchMyWkInstance,
} from '@/api/workflow/instance';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { FileExplorer } from '@/components/files/FileExplorer';
import FormViewer from '@/components/form/FormViewer';
import { FormSection } from '@/types/workflow/form/form.types';
import {
  AttachCatalogue,
  WorkflowInstance,
} from '@/types/workflow/instance/processInstance.types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Animated,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Heading } from '@/components/ui/heading';
import { AntDesign, Feather } from '@expo/vector-icons';

export default function ProcessDetails() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [formSections, setFormSections] = useState<FormSection[]>([]);
  const [attachments, setAttachments] = useState<AttachCatalogue[]>([]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerAnim = useState(new Animated.Value(0))[0];

  const toggleDrawer = () => {
    if (!drawerVisible) {
      setDrawerVisible(true);
      Animated.timing(drawerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '实例详情',
      headerMode: 'screen',
      headerBackVisible: false,
      headerRight: () => (
        <Button
          onPress={() => console.log('更多操作')}
          title="..."
          color="#2563EB"
        />
      ),
    });
  }, [navigation]);
  useEffect(() => {
    (async () => {
      console.log(params);
      const wkInstance = await fetchMyWkInstance({
        workflowId: params.wkInstanceId.toString(),
      });
      if (wkInstance as WorkflowInstance) {
        const instance = wkInstance as WorkflowInstance;
        if (instance.currentExecutionPointer?.extensionAttributes?.form_data) {
          setFormSections(
            instance.currentExecutionPointer.extensionAttributes.form_data,
          );
          const attachs = await fetchAttachmentByReferenceAsync([
            { referenceType: 1, reference: instance.reference },
          ]);
          if (attachs as AttachCatalogue[]) {
            setAttachments(attachs as AttachCatalogue[]);
          }
        }
      }
    })();
  }, []);
  return (
    <>
      <View style={styles.wrapper}>
        <FormViewer sections={formSections} />
        <TouchableOpacity
          style={styles.verticalButton}
          activeOpacity={0.8}
          onPress={() => {
            toggleDrawer();
          }}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>查</Text>
            <Text style={styles.buttonText}>看</Text>
            <Text style={styles.buttonText}>附</Text>
            <Text style={styles.buttonText}>件</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Drawer
        isOpen={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
        }}
        size="lg"
        anchor="bottom"
      >
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <Heading size="md">查看附件</Heading>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setDrawerVisible(false);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <AntDesign name="closecircle" size={20} color="#000" />
            </TouchableOpacity>
          </DrawerHeader>
          <DrawerBody>
            <FileExplorer data={attachments} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <SafeAreaView style={styles.buttonContainer}>
        <View style={styles.buttonGroup}>
          {/* 驳回按钮 */}
          <TouchableOpacity
            style={[styles.button, styles.rejectButton]}
            activeOpacity={0.8}
            onPress={() => console.log('驳回')}
          >
            <AntDesign name="closecircleo" size={24} color="#FF4D4F" />
            <Text style={[styles.buttonControlText, { color: '#FF4D4F' }]}>
              驳回
            </Text>
          </TouchableOpacity>

          {/* 转交按钮 */}
          <TouchableOpacity
            style={[styles.button, styles.transferButton]}
            activeOpacity={0.8}
            onPress={() => console.log('转交')}
          >
            <AntDesign name="swap" size={24} color="#808080" />
            <Text style={[styles.buttonControlText, { color: '#808080' }]}>
              转交
            </Text>
          </TouchableOpacity>

          {/* 通过按钮 */}
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            activeOpacity={0.8}
            onPress={() => console.log('通过')}
          >
            <AntDesign name="checkcircleo" size={24} color="#1890FF" />
            <Text style={[styles.buttonControlText, { color: '#1890FF' }]}>
              通过
            </Text>
          </TouchableOpacity>
          {/* 更多 */}
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            activeOpacity={0.8}
            onPress={() => console.log('通过')}
          >
            <Feather name="more-horizontal" size={24} color="black" />
            <Text style={[styles.buttonControlText, { color: 'black' }]}>
              更多
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  //控制按钮
  buttonContainer: {
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
    paddingVertical: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'column',
    gap: 6, // RN 0.71+ 支持
  },
  rejectButton: {
    //backgroundColor: 'rgba(255,77,79,0.1)',
  },
  transferButton: {
    //backgroundColor: 'rgba(128,128,128,0.1)',
  },
  approveButton: {
    //backgroundColor: 'rgba(24,144,255,0.1)',
  },
  moreButton: {
    //backgroundColor: 'rgba(24,144,255,0.1)',
  },
  buttonControlText: {
    fontSize: 14,
    fontWeight: '500',
  },
  //控制按钮
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 0,
    zIndex: 9999,
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  verticalButton: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: '#1890ff',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 3,
    elevation: 3,
    shadowColor: 'rgba(24, 144, 255, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    writingDirection: 'rtl',
    textAlignVertical: 'center',
  },
  actionButton: {
    backgroundColor: '#1890ff',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 4,
    padding: 16,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#595959',
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 15,
    color: '#1f1f1f',
  },
});
