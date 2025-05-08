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
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { fetchMyWkInstances } from '@/api/workflow/instance';
import { PaginationParams } from '@/types/page.types';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { useRouter } from 'expo-router';
import RouteGuard from '../../components/Common/RouteGuard';
const getProcessInstanceStateTitle = (value: any) => {
  const states: Record<string, string> = {
    Runnable: '运行中',
    Suspended: '挂起',
    Complete: '完成',
    Terminated: '终止',
  };
  return states[value];
};

const BusinessBaseCard = ({ item }: { item: ProcessInstance }) => {
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
      className="flex-1" // 确保点击区域覆盖整个卡片
    >
      <Card
        className="p-2 rounded-lg m-2"
        key={item.id}
        style={{ minHeight: 120 }}
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
    </TouchableOpacity>
  );
};
const PAGE_SIZE = 10;
export default function TabOneScreen() {
  const [data, setData] = useState<ProcessInstance[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // 加载数据
  const loadData = async (currentPage: number, isRefreshing = false) => {
    if (loading || (!isRefreshing && !hasMore)) return;

    setLoading(true);
    try {
      const params: PaginationParams = {
        skipCount: (currentPage - 1) * PAGE_SIZE,
        maxResultCount: PAGE_SIZE,
      };
      const newData = await fetchMyWkInstances(params);

      setData((prev) =>
        isRefreshing ? [...newData.items] : [...prev, ...newData.items],
      );
      console.log('当前页码:', currentPage);
      console.log(
        '获取数据:',
        newData.items.map((i) => i.id),
      );
      console.log('总数据量:', data.length);
      setHasMore(newData.totalCount > currentPage * PAGE_SIZE);
      if (!isRefreshing) {
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };
  //hasMore;
  // 下拉刷新
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  }, []);

  // 加载更多
  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadData(page);
    }
  }, [page, loading, hasMore]);
  //const debouncedLoadMore = debounce(onEndReached, 500);
  // 底部加载指示器
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
    let isMounted = true;
    const initLoad = async () => {
      if (isMounted) {
        await loadData(1);
      }
    };
    initLoad();
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <>
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
          style={{ flex: 1 }}
          data={data}
          renderItem={BusinessBaseCard}
          keyExtractor={(item) => item.id}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.2}
          ListFooterComponent={ListFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
            />
          }
          removeClippedSubviews={false} // 禁用视图裁剪
          maxToRenderPerBatch={10} // 控制渲染批次
          initialNumToRender={10} // 初始渲染数量
          windowSize={21} // 预渲染窗口
        />
      </RouteGuard>
    </>
  );
}
