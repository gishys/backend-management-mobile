import { Text } from '@/components/ui/text';
import { ProcessInstance } from '@/types/workflow/instance/processInstance.types';
import { SearchIcon } from '@/components/ui/icon';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Platform,
  View,
  StyleSheet,
  Text as RNText,
} from 'react-native';
import { useCallback, useEffect, useState, useRef } from 'react';
import { fetchMyWkInstances } from '@/api/workflow/instance';
import { PaginationParams } from '@/types/page.types';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import RouteGuard from '@/components/Common/RouteGuard';
import React from 'react';
import ProcessInstanceCard from '@/components/workflow/ProcessInstanceCard';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 10;

export default function MyProcesses() {
  const navigation = useNavigation();
  const [data, setData] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '我的办理',
      headerBackVisible: true,
    });
  }, [navigation]);

  const loadData = async (isRefreshing = false) => {
    if (loading || (!isRefreshing && !hasMore)) return;

    setLoading(true);
    try {
      const skipCount = isRefreshing ? 0 : data.length;
      const params: PaginationParams & Record<string, any> = {
        skipCount,
        maxResultCount: PAGE_SIZE,
        // 如果需要区分"我发起的"和"需要我审批的"，可以添加参数
        // 例如：isInitiated: true 或类似的参数
        // 具体参数需要根据后端 API 文档确定
      };

      // 如果有搜索文本，添加搜索参数
      if (searchText.trim()) {
        params.keyword = searchText.trim();
      }

      const newData = await fetchMyWkInstances(params);

      setData((prev) => {
        const updatedData = isRefreshing
          ? newData.items
          : [...prev, ...newData.items];
        return updatedData;
      });

      const currentTotalLoaded = skipCount + newData.items.length;
      setHasMore(newData.totalCount > currentTotalLoaded);
    } catch (error) {
      console.error('加载我的办理数据失败:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadData(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore]);

  // 搜索处理 - 使用 debounce
  const handleSearchChange = (text: string) => {
    setSearchText(text);

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的定时器，延迟 500ms 后执行搜索
    searchTimeoutRef.current = setTimeout(() => {
      setHasMore(true);
      setData([]); // 清空数据，重新加载
      loadData(true);
    }, 500);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const ListFooter = () =>
    loading && !refreshing ? (
      <ActivityIndicator
        size="large"
        style={styles.loadingIndicator}
        color="#6366f1"
      />
    ) : !hasMore && data.length > 0 ? (
      Platform.OS === 'web' ? (
        <RNText style={styles.footerText}>没有更多数据</RNText>
      ) : (
        <Text style={styles.footerText}>没有更多数据</Text>
      )
    ) : null;

  useEffect(() => {
    loadData(true);
  }, []);

  const content = (
    <>
      <View style={styles.searchContainer}>
        <Input>
          <InputSlot>
            <InputIcon as={SearchIcon} />
          </InputSlot>
          <InputField
            placeholder="搜索流程类型、业务号..."
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </Input>
      </View>
      <FlatList<ProcessInstance>
        data={data}
        renderItem={({ item }) => <ProcessInstanceCard item={item} />}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooter}
        initialNumToRender={PAGE_SIZE}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            {...(Platform.OS !== 'web' && { colors: ['#6366f1'] })}
          />
        }
        ListEmptyComponent={
          !loading ? (
            Platform.OS === 'web' ? (
              <RNText style={styles.emptyText}>暂无办理记录</RNText>
            ) : (
              <Text style={styles.emptyText}>暂无办理记录</Text>
            )
          ) : null
        }
      />
    </>
  );

  return (
    <RouteGuard>
      {Platform.OS === 'web' ? (
        <View style={styles.container}>{content}</View>
      ) : (
        <SafeAreaView style={styles.container} edges={['top']}>
          {content}
        </SafeAreaView>
      )}
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    margin: 8,
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  footerText: {
    textAlign: 'center',
    padding: 16,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    padding: 32,
    color: '#999',
    fontSize: 16,
  },
});
