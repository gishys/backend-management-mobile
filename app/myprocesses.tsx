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
  Pressable,
} from 'react-native';
import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { fetchMyWkInstances } from '@/api/workflow/instance';
import { PaginationParams } from '@/types/page.types';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import RouteGuard from '@/components/Common/RouteGuard';
import React from 'react';
import ProcessInstanceCard from '@/components/workflow/ProcessInstanceCard';
import { useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { statsTheme } from '@/components/stats';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';

/** 每页条数 */
const PAGE_SIZE = 10;
/** 搜索防抖延迟（毫秒） */
const SEARCH_DEBOUNCE_MS = 500;

/**
 * 我的办理 - 搜索栏（单一职责：展示与回调）
 */
function MyProcessesSearchBar({
  value,
  onChangeText,
  placeholder = '搜索流程类型、业务号...',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchWrap}>
      <Input
        size="md"
        variant="outline"
        className="rounded-xl border-border-200 bg-background-50"
      >
        <InputSlot>
          <InputIcon as={SearchIcon} className="text-typography-500" />
        </InputSlot>
        <InputField
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel="搜索办理记录"
          accessibilityHint="输入流程类型或业务号进行筛选"
        />
      </Input>
    </View>
  );
}

export default function MyProcesses() {
  const navigation = useNavigation();
  const toast = useToast();
  const [data, setData] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTextRef = useRef(searchText);
  searchTextRef.current = searchText;

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '我的办理',
      headerBackVisible: true,
      headerBackTitle: '我的',
      headerStyle: {
        backgroundColor: statsTheme.colors.background,
      },
      headerTintColor: statsTheme.colors.text?.primary ?? '#fff',
      headerShadowVisible: false,
    });
  }, [navigation]);

  const loadData = useCallback(
    async (isRefreshing = false) => {
      if (loading || (!isRefreshing && !hasMore)) return;

      setLoading(true);
      setError(null);
      try {
        const skipCount = isRefreshing ? 0 : data.length;
        const keyword = searchTextRef.current.trim();
        const params: PaginationParams & Record<string, unknown> = {
          skipCount,
          maxResultCount: PAGE_SIZE,
        };
        if (keyword) params.keyword = keyword;

        const newData = await fetchMyWkInstances(params);

        setData((prev) =>
          isRefreshing ? newData.items : [...prev, ...newData.items]
        );

        const currentTotalLoaded = skipCount + newData.items.length;
        setHasMore(newData.totalCount > currentTotalLoaded);
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : '加载失败，请稍后重试';
        setError(message);
        toast.show({
          placement: 'top',
          duration: 3000,
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>加载失败</ToastTitle>
              <ToastDescription>{message}</ToastDescription>
            </Toast>
          ),
        });
      } finally {
        setLoading(false);
        if (isRefreshing) setRefreshing(false);
      }
    },
    [loading, hasMore, data.length, toast]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    setError(null);
    loadData(true);
  }, [loadData]);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore && !error) loadData(false);
  }, [loading, hasMore, error, loadData]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchText(text);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setHasMore(true);
        setError(null);
        setData([]);
        loadData(true);
      }, SEARCH_DEBOUNCE_MS);
    },
    [loadData]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  /** 初始加载（仅挂载时执行一次，避免 loadData 变更导致重复请求） */
  useEffect(() => {
    loadData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ProcessInstance }) => <ProcessInstanceCard item={item} />,
    []
  );

  const keyExtractor = useCallback((item: ProcessInstance) => item.id, []);

  const ListFooterComponent = useMemo(
    () =>
      function ListFooter() {
        if (loading && !refreshing) {
          return (
            <View style={styles.footerLoader}>
              <ActivityIndicator
                size="small"
                color={statsTheme.colors.primary}
                accessibilityLabel="加载中"
              />
              <Text style={styles.footerLoaderText}>加载中...</Text>
            </View>
          );
        }
        if (!hasMore && data.length > 0) {
          const FooterText =
            Platform.OS === 'web' ? RNText : Text;
          return (
            <FooterText style={styles.footerEnd} accessibilityLabel="已加载全部">
              没有更多数据
            </FooterText>
          );
        }
        return null;
      },
    [loading, refreshing, hasMore, data.length]
  );

  const ListEmptyComponent = useMemo(
    () =>
      function ListEmpty() {
        if (loading && data.length === 0) return null;
        if (error) {
          return (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>加载失败</Text>
              <Text style={styles.emptyHint}>{error}</Text>
              <Pressable
                onPress={() => loadData(true)}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.retryButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="重试加载"
              >
                <Text style={styles.retryButtonText}>重试</Text>
              </Pressable>
            </View>
          );
        }
        const EmptyText = Platform.OS === 'web' ? RNText : Text;
        return (
          <EmptyText style={styles.emptyText} accessibilityLabel="暂无办理记录">
            暂无办理记录
          </EmptyText>
        );
      },
    [loading, data.length, error, loadData]
  );

  const content = (
    <>
      <MyProcessesSearchBar
        value={searchText}
        onChangeText={handleSearchChange}
      />
      <FlatList<ProcessInstance>
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={PAGE_SIZE}
        contentContainerStyle={data.length === 0 ? styles.listContentEmpty : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            {...(Platform.OS !== 'web' && {
              colors: [statsTheme.colors.primary],
            })}
          />
        }
        accessibilityLabel="办理记录列表"
      />
    </>
  );

  return (
    <RouteGuard>
      {Platform.OS === 'web' ? (
        <View style={styles.container}>{content}</View>
      ) : (
        <SafeAreaView style={styles.container} edges={[]}>
          {content}
        </SafeAreaView>
      )}
    </RouteGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: statsTheme.colors.background,
  },
  searchWrap: {
    paddingHorizontal: statsTheme.spacing.page,
    paddingTop: statsTheme.spacing.sm,
    paddingBottom: statsTheme.spacing.xs,
  },
  listContent: {
    paddingBottom: statsTheme.spacing.section,
  },
  listContentEmpty: {
    flexGrow: 1,
    paddingBottom: statsTheme.spacing.section,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: statsTheme.spacing.lg,
    gap: statsTheme.spacing.sm,
  },
  footerLoaderText: {
    fontSize: 14,
    color: statsTheme.colors.text.secondary,
  },
  footerEnd: {
    textAlign: 'center',
    paddingVertical: statsTheme.spacing.lg,
    paddingHorizontal: statsTheme.spacing.page,
    fontSize: 14,
    color: statsTheme.colors.text.tertiary,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: statsTheme.spacing.section,
    paddingHorizontal: statsTheme.spacing.page,
    fontSize: 16,
    color: statsTheme.colors.text.tertiary,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: statsTheme.spacing.xl,
    paddingVertical: statsTheme.spacing.section,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: statsTheme.colors.text.primary,
    marginBottom: statsTheme.spacing.xs,
  },
  emptyHint: {
    fontSize: 14,
    color: statsTheme.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: statsTheme.spacing.lg,
  },
  retryButton: {
    paddingHorizontal: statsTheme.spacing.xl,
    paddingVertical: statsTheme.spacing.md,
    backgroundColor: statsTheme.colors.primary,
    borderRadius: statsTheme.radius.md,
  },
  retryButtonPressed: {
    opacity: 0.85,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
