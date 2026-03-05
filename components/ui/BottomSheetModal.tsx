'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/** 底部弹层高度比例，默认 75% */
const DEFAULT_HEIGHT_RATIO = 0.75;

export interface BottomSheetModalProps {
  /** 是否显示 */
  visible: boolean;
  /** 关闭回调，仅通过关闭按钮或遮罩调用，避免与打开手势冲突 */
  onClose: () => void;
  /** 子内容 */
  children: React.ReactNode;
  /** 高度比例 0~1，默认 0.75 */
  heightRatio?: number;
  /** 点击遮罩是否关闭，默认 true */
  closeOnBackdrop?: boolean;
  /** 打开后延迟多少 ms 才允许遮罩关闭，防止“一闪即关” */
  backdropCloseDelayMs?: number;
}

/**
 * 基于 RN Modal 的底部弹层，避免 gluestack Drawer 导致的闪关、点不开等问题。
 * 仅通过 visible 与 onClose 控制，不依赖第三方 Modal 实现。
 */
export function BottomSheetModal({
  visible,
  onClose,
  children,
  heightRatio = DEFAULT_HEIGHT_RATIO,
  closeOnBackdrop = true,
  backdropCloseDelayMs = 200,
}: BottomSheetModalProps) {
  const openedAt = useRef<number>(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      openedAt.current = Date.now();
    }
  }, [visible]);

  // 键盘弹出时缩小面板高度，使内容区域（含输入框）保持在可视区域内
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const panelHeight = keyboardHeight > 0
    ? Math.min(SCREEN_HEIGHT * heightRatio, SCREEN_HEIGHT - keyboardHeight - 24)
    : SCREEN_HEIGHT * heightRatio;

  const handleBackdropPress = () => {
    if (!closeOnBackdrop) return;
    const elapsed = Date.now() - openedAt.current;
    if (elapsed < backdropCloseDelayMs) return;
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="关闭"
        />
        <View style={[styles.panel, { height: panelHeight }]}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
});

export default BottomSheetModal;
