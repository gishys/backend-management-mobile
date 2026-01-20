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
import RouteGuard from '../../components/Common/RouteGuard';
import React from 'react';
import ProcessInstanceCard from '@/components/workflow/ProcessInstanceCard';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

const PAGE_SIZE = 10;

export default function OnlineApprove() {
  const navigation = useNavigation();
  const toast = useToast();
  const [data, setData] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '在线审批',
    });
  }, [navigation]);

  const dataLengthRef = useRef(0);
  dataLengthRef.current = data.length;

  const loadData = useCallback(
    async (isRefreshing = false) => {
      if (loading || (!isRefreshing && !hasMore)) return;

      setLoading(true);
      try {
        const skipCount = isRefreshing ? 0 : dataLengthRef.current;
        const params: PaginationParams & Record<string, any> = {
          skipCount,
          maxResultCount: PAGE_SIZE,
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
      } catch (error: any) {
        console.error('加载审批数据失败:', error);
        
        // 显示错误提示
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          '加载数据失败，请稍后重试';
        
        toast.show({
          placement: 'top',
          duration: 3000,
          render: ({ id }) => {
            return (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>加载失败</ToastTitle>
                <ToastDescription>{errorMessage}</ToastDescription>
              </Toast>
            );
          },
        });
      } finally {
        setLoading(false);
        if (isRefreshing) setRefreshing(false);
      }
    },
    [loading, hasMore, searchText, toast],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    loadData(true);
  }, [loadData]);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadData(false);
    }
  }, [loading, hasMore, loadData]);

  // 搜索处理 - 使用 debounce
  const handleSearchChange = useCallback(
    (text: string) => {
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
    },
    [loadData],
  );

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

  // 只在组件挂载时加载数据
  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => (
    <>
      <View style={styles.searchContainer}>
        <Input variant="outline" size="md">
          <InputSlot className="pl-3">
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
          !loading && !refreshing && data.length === 0 ? (
            <View style={styles.emptyContainer}>
              {Platform.OS === 'web' ? (
                <RNText style={styles.emptyText}>
                  {searchText.trim()
                    ? '未找到匹配的审批记录'
                    : '暂无待审批记录'}
                </RNText>
              ) : (
                <Text style={styles.emptyText}>
                  {searchText.trim()
                    ? '未找到匹配的审批记录'
                    : '暂无待审批记录'}
                </Text>
              )}
            </View>
          ) : null
        }
      />
    </>
  );

  return (
    <RouteGuard>
      <View style={styles.container}>{renderContent()}</View>
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});
