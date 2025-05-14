import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { AntDesign, MaterialIcons, Fontisto } from '@expo/vector-icons';
import {
  AttachCatalogue,
  AttachFile,
} from '@/types/workflow/instance/processInstance.types';
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalBody,
} from '@/components/ui/modal';
import { Heading } from '../ui/heading';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Image } from 'expo-image';

type TreeItemProps = {
  item: AttachCatalogue;
  level: number;
  onToggle: (id: string) => void;
  expandedIds: Set<string>;
  onFilePreView: (urls: string[]) => void;
};

// 文件类型颜色映射
const getFileColor = (type?: string): string => {
  const colors: { [key: string]: string } = {
    pdf: '#FF4444',
    docx: '#2196F3',
    xlsx: '#4CAF50',
    pptx: '#FF9800',
    jpg: '#9C27B0',
    '.png': '#3F51B5',
    default: '#666',
  };
  return type ? colors[type.toLowerCase()] : colors.default;
};

// 文件大小格式化
const formatSize = (size?: number): string => {
  if (!size) return `0B`;
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
};

function isAttachCatalogue(obj: any) {
  return (
    typeof obj.id === 'string' &&
    typeof obj.reference === 'string' &&
    typeof obj.referenceType === 'number' &&
    typeof obj.attachReceiveType === 'number' &&
    typeof obj.catalogueName === 'string' &&
    typeof obj.sequenceNumber === 'number' &&
    typeof obj.isStatic === 'boolean' &&
    typeof obj.creationTime === 'string' &&
    typeof obj.creatorId === 'string'
  );
}

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  onToggle,
  expandedIds,
  onFilePreView,
}) => {
  const [rotateAnim] = useState(new Animated.Value(0));
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = !!item.children?.length;
  const hasFiles = !!item.attachFiles?.length;
  const hasFileOrForder: 'file' | 'forder' = isAttachCatalogue(item)
    ? 'forder'
    : 'file';
  const indent = level * 12;

  // 处理展开动画
  const runAnimation = () => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // 合并子目录和文件（先显示文件后显示子目录）
  const mergedChildren = [
    ...(item.attachFiles?.map((file) => ({
      type: 'file',
      data: file,
    })) || []),
    ...(item.children?.map((child) => ({
      type: 'folder',
      data: child,
    })) || []),
  ];

  return (
    <View style={[styles.nodeContainer, { marginLeft: indent }]}>
      {/* 当前节点头部 */}
      <View style={styles.nodeHeader}>
        {/* 展开按钮（有子项或者有文件时显示） */}
        {(hasChildren || hasFiles) && (
          <TouchableOpacity
            onPress={() => {
              onToggle(item.id);
              runAnimation();
            }}
            style={styles.caretButton}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '90deg'],
                    }),
                  },
                ],
              }}
            >
              <AntDesign name="right" size={14} color="#666" />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* 图标区 */}
        <View style={styles.iconWrapper}>
          {hasFileOrForder === 'forder' ? (
            <AntDesign name="folder1" size={20} color="#FFA940" />
          ) : (
            <MaterialIcons
              name="insert-drive-file"
              size={20}
              color={getFileColor(item.attachFiles?.[0]?.fileType)}
            />
          )}
        </View>

        {/* 主要内容 */}
        <View style={styles.contentArea}>
          <Text style={styles.name} numberOfLines={1}>
            {hasFileOrForder
              ? item.catalogueName
              : item.attachFiles?.[0]?.fileName}
          </Text>

          {hasFileOrForder ? (
            <Text style={styles.meta}>
              {item.children?.length}个子目录 · {item.attachFiles?.length || 0}
              个文件
            </Text>
          ) : (
            <View style={styles.fileMeta}>
              <Text style={styles.meta}>
                {formatSize(item.attachFiles?.[0]?.fileSize)} · 下载{' '}
                {item.attachFiles?.[0]?.downloadTimes || 0}次
              </Text>
              {item.attachFiles?.[0]?.fileType && (
                <Text style={styles.typeBadge}>
                  {item.attachFiles[0].fileType.toUpperCase()}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* 操作按钮 */}
        {hasFileOrForder ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              onFilePreView(
                item.attachFiles?.map((file) => file.filePath) || [],
              );
            }}
          >
            <Text style={styles.actionText}>查看</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.downloadBtn} onPress={() => {}}>
            <Fontisto name="preview" size={20} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* 展开内容区域 */}
      {isExpanded && (hasChildren || hasFiles) && (
        <View style={styles.childrenArea}>
          <ScrollView
            style={styles.childrenArea}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true} // 允许嵌套滚动
          >
            {mergedChildren.map((child, index) => (
              <React.Fragment key={child.data.id}>
                {child.type === 'folder' ? (
                  <TreeItem
                    item={child.data as AttachCatalogue}
                    level={level + 1}
                    onToggle={onToggle}
                    expandedIds={expandedIds}
                    onFilePreView={onFilePreView}
                  />
                ) : (
                  <FileItem
                    file={child.data as AttachFile}
                    level={level + 1}
                    onFilePreView={onFilePreView}
                  />
                )}
                {/* 添加分隔线（除最后一项外） */}
                {index !== mergedChildren.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// 单独的文件项组件
const FileItem: React.FC<{
  file: AttachFile;
  level: number;
  onFilePreView: (urls: string[]) => void;
}> = ({ file, level, onFilePreView }) => {
  return (
    <View style={[styles.fileContainer, { marginLeft: level * 12 + 28 }]}>
      <MaterialIcons
        name="insert-drive-file"
        size={18}
        color={getFileColor(file.fileType)}
      />
      <View style={styles.fileContent}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName}
        </Text>
        <View style={styles.fileMeta}>
          <Text style={styles.fileMetaText}>
            {formatSize(file.fileSize)} · 下载 {file.downloadTimes}次
          </Text>
          <Text style={styles.typeBadge}>{file.fileType.toUpperCase()}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.smallDownloadBtn}
        onPress={() => {
          onFilePreView([file.filePath]);
        }}
      >
        <Fontisto name="preview" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

// 文件浏览器主组件
export const FileExplorer: React.FC<{ data: AttachCatalogue[] }> = ({
  data,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <ScrollView style={styles.container} nestedScrollEnabled={true}>
        {data.map((item) => (
          <TreeItem
            key={item.id}
            item={item}
            level={0}
            onToggle={handleToggle}
            expandedIds={expandedIds}
            onFilePreView={(urls) => {
              setImages(urls.map((url) => url));
              setIsFullScreen(true);
            }}
          />
        ))}
      </ScrollView>
      <Modal
        isOpen={isFullScreen}
        onClose={() => {
          setIsFullScreen(false);
        }}
        size="full"
        style={{ height: '100%' }}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size="md" className="text-typography-950">
              查看图片
            </Heading>
            <ModalCloseButton>
              <Icon
                as={CloseIcon}
                size="md"
                className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
              />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <View style={styles.imageBodyContainer}>
              <Image
                style={styles.image}
                source={images.length > 0 ? images[0] : undefined}
                placeholder={
                  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj['
                }
                contentFit="cover"
                transition={1000}
                onError={(e) => console.log('Image error:', e.error)}
              />
            </View>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// 样式表
const styles = StyleSheet.create({
  imageBodyContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 300,
    backgroundColor: '#0553',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  nodeContainer: {
    marginHorizontal: 8,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    marginVertical: 0,
  },
  caretButton: {
    padding: 4,
    marginRight: 8,
  },
  iconWrapper: {
    marginRight: 12,
  },
  contentArea: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#666',
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#EEE',
    paddingHorizontal: 6,
    borderRadius: 4,
    fontSize: 10,
    color: '#666',
    lineHeight: 18,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E6F4FF',
    borderRadius: 6,
  },
  actionText: {
    color: '#1677FF',
    fontSize: 13,
  },
  downloadBtn: {
    padding: 6,
    backgroundColor: '#1677FF',
    borderRadius: 6,
  },
  childrenArea: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 6,
    marginVertical: 2,
  },
  fileContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  fileMetaText: {
    fontSize: 12,
    color: '#888',
  },
  smallDownloadBtn: {
    padding: 4,
    backgroundColor: '#1677FF',
    borderRadius: 4,
  },
});
