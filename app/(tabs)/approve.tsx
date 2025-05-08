import { Badge, BadgeIcon, BadgeText } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { ProcessInstance } from '@/types/workflow/instance/processInstance.types';
import { EditIcon, SearchIcon } from '@/components/ui/icon';
import { debounce } from 'lodash';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { fetchMyWkInstances } from '@/api/workflow/instance';
import { PaginationParams } from '@/types/page.types';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { useRouter } from 'expo-router';
import RouteGuard from '../../components/Common/RouteGuard';
import React from 'react';

const getProcessInstanceStateTitle = (value: any) => {
  const states: Record<string, string> = {
    Runnable: '运行中',
    Suspended: '挂起',
    Complete: '完成',
    Terminated: '终止',
  };
  return states[value];
};

const BusinessBaseCard = React.memo(({ item }: { item: ProcessInstance }) => {
  const route = useRouter();
  const navigateProcessDetails = (id: string) => {
    route.push({
      pathname: '/processdetails',
      params: { wkInstanceId: id },
    });
  };
  const debouncedLoadMore = debounce(navigateProcessDetails, 500);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        debouncedLoadMore(item.id);
      }}
      className="flex-1"
    >
      <View style={{ flex: 1, minHeight: 120 }}>
        <Card
          className="p-2 rounded-lg m-2"
          key={item.id}
          style={{ minHeight: 120, overflow: 'visible', flexShrink: 0 }}
        >
          <Badge className="absolute top-0 right-0 w-[3px] h-[12px] bg-red-600 rounded-tr-lg" />
          <HStack
            space="md"
            reversed={false}
            className="items-center justify-between mb-2"
          >
            <Heading size="md">{item.processType}</Heading>
            <Text className="text-sm font-normal text-typography-700">
              {format(new Date(item.receivingTime), 'yyyy-MM-dd HH:mm')}
            </Text>
          </HStack>
          <Text className="text-sm font-normal mb-1 text-typography-700">
            当前环节：{item.processingStepName}
          </Text>
          <Text className="text-sm font-normal mb-1 text-typography-700">
            业务号：{item.reference}
          </Text>
          <Text className="text-sm font-normal mb-2 text-typography-700">
            权利人：{item.data['']}
          </Text>
          <HStack
            space="md"
            reversed={false}
            className="items-center justify-between"
          >
            <HStack className="items-center justify-between">
              <Avatar size="sm" className="bg-white-700">
                <AvatarFallbackText>Jane Doe</AvatarFallbackText>
                <AvatarImage
                  source={require('../../assets/images/global/default-user.png')}
                />
                <AvatarBadge size="sm" />
              </Avatar>
              <Text className="text-sm font-normal mb-2 text-typography-700 ml-2">
                {item.recipient}
              </Text>
            </HStack>
            <Badge size="md" variant="solid" action="info">
              <BadgeText>{getProcessInstanceStateTitle(item.state)}</BadgeText>
              <BadgeIcon as={EditIcon} className="ml-2" />
            </Badge>
          </HStack>
        </Card>
      </View>
    </TouchableOpacity>
  );
});

const PAGE_SIZE = 10;
export default function TabOneScreen() {
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

  const handleMomentumScrollEnd = useCallback(
    ({ nativeEvent }: any) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const paddingToBottom = 20;
      const isNearBottom =
        contentOffset.y + layoutMeasurement.height >=
        contentSize.height - paddingToBottom;

      if (isNearBottom && !loading && hasMore) {
        loadData(false);
      }
    },
    [loading, hasMore],
  );

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
      <FlatList
        data={data}
        renderItem={({ item }) => <BusinessBaseCard item={item} />}
        keyExtractor={(item) => `${item.id}-${data.length}`}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.1}
        ListFooterComponent={ListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            progressViewOffset={50}
          />
        }
        contentContainerStyle={{
          paddingBottom: 20, // 确保底部有空间触发加载
        }}
        // 添加以下 iOS 特定配置
        removeClippedSubviews={false}
        directionalLockEnabled={true}
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 1 }} // 确保列表填充容器
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
    </RouteGuard>
  );
}
