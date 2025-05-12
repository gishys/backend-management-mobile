import { Text } from '@/components/ui/text';
import { ProcessInstance } from '@/types/workflow/instance/processInstance.types';
import { SearchIcon } from '@/components/ui/icon';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { fetchMyWkInstances } from '@/api/workflow/instance';
import { PaginationParams } from '@/types/page.types';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import RouteGuard from '../../components/Common/RouteGuard';
import React from 'react';
import ProcessInstanceCard from '@/components/workflow/ProcessInstanceCard';

const PAGE_SIZE = 10;
export default function OnlineApprove() {
  const [data, setData] = useState<ProcessInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadData = async (isRefreshing = false) => {
    if (loading || (!isRefreshing && !hasMore)) return;

    console.log('开始加载数据，刷新模式:', isRefreshing);
    setLoading(true);
    try {
      const skipCount = isRefreshing ? 0 : data.length;
      const params: PaginationParams = {
        skipCount,
        maxResultCount: PAGE_SIZE,
      };
      console.log('请求参数:', params);

      const newData = await fetchMyWkInstances(params);
      console.log('API返回数据:', {
        itemsCount: newData.items.length,
        total: newData.totalCount,
      });

      setData((prev) => {
        const updatedData = isRefreshing
          ? newData.items
          : [...prev, ...newData.items];
        console.log('更新后数据长度:', updatedData.length);
        console.log(
          'Data updated:',
          isRefreshing ? 'Refresh' : 'Load more',
          'prev:',
          prev.length,
          'new:',
          newData.items.length,
          'total:',
          updatedData.length,
        );
        return updatedData;
      });

      const currentTotalLoaded = skipCount + newData.items.length;
      setHasMore(newData.totalCount > currentTotalLoaded);
      console.log('是否有更多数据:', newData.totalCount > currentTotalLoaded);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    loadData(true);
  }, []);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadData(false);
    }
  }, [loading, hasMore]);

  const ListFooter = () =>
    loading && !refreshing ? (
      <ActivityIndicator
        size="large"
        style={{ marginVertical: 20 }}
        color="#6366f1"
      />
    ) : !hasMore ? (
      <Text style={{ textAlign: 'center', padding: 16 }}>没有更多数据</Text>
    ) : null;

  useEffect(() => {
    loadData(true);
  }, []);

  return (
    <RouteGuard>
      <Input className="m-2">
        <InputSlot className="pl-3">
          <InputIcon as={SearchIcon} />
        </InputSlot>
        <InputField
          placeholder="输入要搜索的内容"
          onChangeText={() => {
            onRefresh();
          }}
        />
      </Input>
      <FlatList<ProcessInstance>
        data={data}
        renderItem={({ item }) => <ProcessInstanceCard item={item} />}
        keyExtractor={(item) => item.id}
        onEndReached={onEndReached}
        ListFooterComponent={ListFooter}
        initialNumToRender={PAGE_SIZE}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
          />
        }
      />
    </RouteGuard>
  );
}
