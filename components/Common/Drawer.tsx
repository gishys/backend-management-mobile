import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const Drawer: React.FC<{
  toggleDrawer: () => void;
  drawerVisible: boolean;
  children: React.ReactNode;
}> = ({ toggleDrawer, drawerVisible, children }) => {
  const drawerAnim = useState(new Animated.Value(0))[0];
  const { height } = Dimensions.get('window');
  const drawerHeight = height * 0.6; // 占屏幕60%
  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [drawerHeight, 0], // 使用固定高度变量
  });
  return (
    <Modal
      visible={drawerVisible}
      transparent
      animationType="none"
      onRequestClose={toggleDrawer}
    >
      <TouchableWithoutFeedback onPress={toggleDrawer}>
        <View style={styles.drawerOverlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateY: drawerTranslateY }],
            height: drawerHeight,
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>查看附件</Text>
          <TouchableOpacity onPress={toggleDrawer}>
            <AntDesign name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f1f1f',
  },
  drawerContent: {
    paddingVertical: 8,
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    //height: 400, // 固定高度
  },
  scrollContainer: {
    flex: 1, // 占据剩余空间
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 30, // 底部留白
  },
});

export default Drawer;
