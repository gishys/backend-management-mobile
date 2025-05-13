import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { AttachCatalogue } from '@/types/workflow/instance/processInstance.types';

const animationConfig = {
  duration: 300,
  useNativeDriver: true,
};

type TreeItemProps = {
  item: AttachCatalogue;
  level: number;
  onPress: (id: string) => void;
  expandedIds: Set<string>;
};

const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  onPress,
  expandedIds,
}) => {
  const [rotate] = useState(new Animated.Value(0));
  const isExpanded = expandedIds.has(item.id);
  const isFolder = !!item.children?.length;

  const animate = () => {
    Animated.timing(rotate, {
      toValue: isExpanded ? 0 : 1,
      ...animationConfig,
    }).start();
  };

  const indent = level * 24;

  return (
    <View style={[styles.container, { marginLeft: indent }]}>
      {/* 展开控制 */}
      {isFolder && (
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => {
            onPress(item.id);
            animate();
          }}
        >
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                  }),
                },
              ],
            }}
          >
            <AntDesign name="right" size={16} color="#666" />
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* 文件/文件夹主体 */}
      <View style={styles.itemContent}>
        {/* 图标区域 */}
        {isFolder ? (
          <AntDesign name="folder1" size={28} color="#2196F3" />
        ) : (
          <MaterialIcons
            name="insert-drive-file"
            size={28}
            color={getFileTypeColor(
              item.attachFiles?.[0]?.fileType || 'unknown',
            )}
          />
        )}

        {/* 信息区域 */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {isFolder
              ? item.catalogueName
              : item.attachFiles?.[0]?.fileName || '未知文件'}
          </Text>
          {isFolder && (
            <Text style={styles.metaText}>
              {item.attachCount}个文件 | {item.pageCount}页
            </Text>
          )}
          {!isFolder && item.attachFiles?.[0] && (
            <View style={styles.fileMeta}>
              <Text style={styles.metaText}>
                {formatFileSize(item.attachFiles[0].fileSize)} | 已下载{' '}
                {item.attachFiles[0].downloadTimes}次
              </Text>
              <Text style={styles.fileType}>
                {item.attachFiles[0].fileType.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* 操作按钮 */}
        {isFolder ? (
          <TouchableOpacity style={styles.folderButton}>
            <Text style={styles.folderBtnText}>打开</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.downloadBtn}>
            <AntDesign name="download" size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* 子项渲染 */}
      {isExpanded && isFolder && item.children && (
        <View style={styles.childrenContainer}>
          <FlatList
            data={item.children}
            keyExtractor={(child) => child.id}
            renderItem={({ item: child }) => (
              <TreeItem
                item={child}
                level={level + 1}
                onPress={onPress}
                expandedIds={expandedIds}
              />
            )}
          />
        </View>
      )}

      {/* 文件列表展示（当是文件项且包含多个文件时） */}
      {!isFolder && item.attachFiles && item.attachFiles.length > 1 && (
        <View style={styles.fileList}>
          {item.attachFiles?.slice(1).map((file, index) => (
            <View key={file.id} style={styles.fileItem}>
              <MaterialIcons
                name="insert-drive-file"
                size={20}
                color={getFileTypeColor(file.fileType)}
              />
              <Text style={styles.fileName}>{file.fileName}</Text>
              <Text style={styles.fileSize}>
                {formatFileSize(file.fileSize)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// 文件类型颜色映射
const getFileTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    pdf: '#FF4444',
    docx: '#2196F3',
    xlsx: '#4CAF50',
    pptx: '#FF9800',
    jpg: '#9C27B0',
    png: '#3F51B5',
    default: '#666',
  };
  return colors[type.toLowerCase()] || colors.default;
};

// 文件大小格式化
const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
};

export const FileExplorer: React.FC<{ data: AttachCatalogue[] }> = ({
  data,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TreeItem
            item={item}
            level={0}
            onPress={toggleExpand}
            expandedIds={expandedIds}
          />
        )}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    paddingRight: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    maxWidth: '60%',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileType: {
    backgroundColor: '#EEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    fontSize: 10,
    color: '#666',
  },
  downloadBtn: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  folderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 6,
    marginLeft: 12,
  },
  folderBtnText: {
    color: '#2196F3',
    fontSize: 14,
  },
  childrenContainer: {
    marginLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#EEE',
  },
  fileList: {
    marginLeft: 52,
    marginTop: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginVertical: 4,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
});
