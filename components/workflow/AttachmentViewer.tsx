import { useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/drawer';
import { Heading } from '../ui/heading';
import { AntDesign } from '@expo/vector-icons';
import { FileExplorer } from '../files/FileExplorer';
import { AttachCatalogue } from '@/types/workflow/instance/processInstance.types';

export default function AttachmentViewer({
  attachments,
}: {
  attachments: AttachCatalogue[];
}) {
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
  return (
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
  verticalButton: {
    position: 'absolute',
    right: 0,
    top: 120,
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
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 0,
    zIndex: 9999,
  },
});
