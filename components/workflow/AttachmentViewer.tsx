import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomSheetModal } from '@/components/ui/BottomSheetModal';
import { Heading } from '../ui/heading';
import { AntDesign } from '@expo/vector-icons';
import { FileExplorer } from '../files/FileExplorer';
import { AttachCatalogue } from '@/types/workflow/instance/processInstance.types';

export default function AttachmentViewer({
  attachments,
}: {
  attachments: AttachCatalogue[];
}) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.verticalButton}
        activeOpacity={0.8}
        onPress={() => setVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>查</Text>
          <Text style={styles.buttonText}>看</Text>
          <Text style={styles.buttonText}>附</Text>
          <Text style={styles.buttonText}>件</Text>
        </View>
      </TouchableOpacity>
      <BottomSheetModal
        visible={visible}
        onClose={() => setVisible(false)}
        heightRatio={0.75}
      >
        <View style={styles.sheetHeader}>
          <Heading size="md">查看附件</Heading>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
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
    </>
  );
}

const styles = StyleSheet.create({
  verticalButton: {
    position: 'absolute',
    right: 0,
    top: 120,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#1890ff',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 3,
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
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e8e8',
    backgroundColor: '#fff',
  },
  sheetBody: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
});
