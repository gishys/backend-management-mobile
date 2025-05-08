import { Text } from '@/components/ui/text';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Button } from 'react-native';

export default function ProcessDetails() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: '实例详情',
      headerMode: 'screen',
      headerBackVisible: false,
      headerRight: () => (
        <Button
          onPress={() => console.log('更多操作')}
          title="..."
          color="#2563EB"
        />
      ),
    });
  }, [navigation]);
  return (
    <>
      <Text>{params.wkInstanceId}</Text>
    </>
  );
}
