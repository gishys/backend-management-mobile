import { ProcessInstance } from '@/types/workflow/instance/processInstance.types';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { TouchableOpacity } from 'react-native';
import React from 'react';
import { debounce } from 'lodash';
import { useRouter } from 'expo-router';
import { Badge, BadgeIcon, BadgeText } from '../ui/badge';
import { HStack } from '../ui/hstack';
import { Heading } from '../ui/heading';
import { format } from 'date-fns';
import {
  Avatar,
  AvatarBadge,
  AvatarFallbackText,
  AvatarImage,
} from '../ui/avatar';
import { EditIcon } from '../ui/icon';
import { getProcessInstanceStateTitle } from '@/utils/workflow';

const ProcessInstanceCard = React.memo(
  ({ item }: { item: ProcessInstance }) => {
    const route = useRouter();
    const navigateProcessDetails = (id: string) => {
      route.push({
        pathname: '/approvaldetails',
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
        key={item.id}
      >
        <Card className="p-2 rounded-lg m-2" key={item.id}>
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
  },
);

export default ProcessInstanceCard;
