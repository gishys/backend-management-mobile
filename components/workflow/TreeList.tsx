import React, { useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface TreeNode {
  id: string;
  name: string;
  type: 'organization' | 'person';
  children?: TreeNode[];
}

interface FlattenedNode extends TreeNode {
  level: number;
  isExpanded: boolean;
  parentIds: string[];
}

interface TreeListProps {
  nodes: TreeNode[];
  onSlectKeys: (keys: string[]) => void;
  selectable?: (node: TreeNode) => boolean;
}

const TreeList: React.FC<TreeListProps> = ({
  nodes,
  onSlectKeys,
  selectable = (n) => n.type === 'person',
}) => {
  const [searchText, setSearchText] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

  // 问题2修复：优化展开状态更新
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      newSet.has(nodeId) ? newSet.delete(nodeId) : newSet.add(nodeId);
      return newSet;
    });
  }, []);

  const toggleSelect = useCallback(
    (nodeId: string, node: TreeNode) => {
      if (!selectable(node)) return;
      setSelectedNodes((prev) => {
        const newSelected = new Set(prev);
        newSelected.has(nodeId)
          ? newSelected.delete(nodeId)
          : newSelected.add(nodeId);
        onSlectKeys([...newSelected]);
        return newSelected;
      });
    },
    [selectable],
  );

  const filteredData = useMemo(() => {
    const flatten = (
      nodes: TreeNode[],
      level: number,
      parentIds: string[],
      matchesSearch: boolean,
    ): FlattenedNode[] => {
      return nodes.reduce<FlattenedNode[]>((acc, node) => {
        const hasMatch = node.name
          .toLowerCase()
          .includes(searchText.toLowerCase());
        const isExpanded = expandedNodes.has(node.id);
        const currentParentIds = [...parentIds, node.id];
        const shouldShow = hasMatch || matchesSearch;

        const newNode: FlattenedNode = {
          ...node,
          level,
          isExpanded,
          parentIds,
        };

        if (shouldShow || parentIds.every((id) => expandedNodes.has(id))) {
          acc.push(newNode);
        }
        if (node.children) {
          const shouldProcessChildren = searchText ? true : isExpanded;
          if (shouldProcessChildren) {
            acc.push(
              ...flatten(
                node.children,
                level + 1,
                currentParentIds,
                hasMatch || matchesSearch,
              ),
            );
          }
        }

        return acc;
      }, []);
    };

    return flatten(nodes, 0, [], false);
  }, [nodes, searchText, expandedNodes]);

  const renderItem = ({ item }: { item: FlattenedNode }) => (
    <TreeNodeComponent
      node={item}
      onToggle={toggleNode}
      onSelect={toggleSelect}
      searchText={searchText}
      isSelected={selectedNodes.has(item.id)}
      showCheckbox={selectable(item)}
    />
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="搜索组织或人员..."
        value={searchText}
        onChangeText={setSearchText}
      />
      {/* 问题1修复：移除外部滚动容器 */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

interface TreeNodeComponentProps {
  node: FlattenedNode;
  onToggle: (id: string) => void;
  onSelect: (id: string, node: TreeNode) => void;
  searchText: string;
  isSelected: boolean;
  showCheckbox: boolean;
}

const TreeNodeComponent = React.memo(
  ({
    node,
    onToggle,
    onSelect,
    searchText,
    isSelected,
  }: TreeNodeComponentProps) => {
    // 问题2修复：优化点击处理
    const handleToggle = () =>
      node.type === 'organization' && onToggle(node.id);

    // 问题3修复：人员节点才显示复选框
    const showCheckbox = node.type === 'person';

    return (
      <View style={[styles.nodeContainer, { paddingLeft: node.level * 20 }]}>
        {/* 合并点击区域 */}
        <TouchableOpacity
          style={styles.nodeContent}
          onPress={handleToggle}
          activeOpacity={0.7}
        >
          {/* 箭头图标 */}
          {node.type === 'organization' && (
            <MaterialIcons
              name={
                node.isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
              }
              size={24}
              color="#666"
            />
          )}

          {/* 类型图标 */}
          <MaterialIcons
            name={node.type === 'organization' ? 'corporate-fare' : 'person'}
            size={18}
            color={node.type === 'organization' ? '#2f95dc' : '#666'}
            style={styles.typeIcon}
          />

          {/* 节点文字 */}
          <Text
            style={styles.nodeText}
            numberOfLines={1} // 防止文字换行
            ellipsizeMode="tail" // 超出显示...
          >
            {highlightMatch(node.name, searchText)}
          </Text>
        </TouchableOpacity>

        {/* 复选框区域 */}
        {showCheckbox && (
          <TouchableOpacity
            onPress={() => onSelect(node.id, node)}
            style={styles.checkboxContainer}
          >
            <MaterialIcons
              name={isSelected ? 'check-box' : 'check-box-outline-blank'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

const highlightMatch = (text: string, searchText: string) => {
  if (!searchText) return text;
  const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === searchText.toLowerCase() ? (
      <Text key={i} style={styles.highlightedText}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  searchBar: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    fontSize: 16,
    elevation: 2,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  typeIcon: {
    marginHorizontal: 8,
  },
  nodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 确保两端对齐
    alignItems: 'center', // 垂直居中
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  nodeContent: {
    flex: 1, // 占据剩余空间
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  checkboxContainer: {
    paddingHorizontal: 12, // 水平内边距
  },
  nodeText: {
    flex: 1, // 允许文本区域伸缩
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  highlightedText: {
    backgroundColor: '#ffeb3b',
  },
});

export default TreeList;
