import ReadOnlyForm from '@/components/form/ReadOnlyForm';
import { FormSection } from '@/types/workflow/form/form.types';
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
  const formSections: FormSection[] = [
    {
      title: '项目详情',
      description: '项目基本信息及状态',
      fields: [
        {
          id: 'project_status',
          label: '项目状态',
          value: 'approved',
          type: 'badge',
          badgeColor: '#52c41a',
        },
        {
          id: 'basic_info',
          label: '基础信息',
          type: 'group',
          value: '点击展开',
          subFields: [
            {
              id: 'project_name',
              label: '项目名称',
              value: '移动端优化项目',
              required: true,
            },
            {
              id: 'project_type',
              label: '项目类型',
              value: 'tech_upgrade',
              type: 'select',
              valueOptions: {
                tech_upgrade: '技术改造',
                new_feature: '新功能开发',
              },
            },
          ],
        },
      ],
    },
    {
      title: '项目详情',
      description: '项目基本信息及状态',
      fields: [
        {
          id: 'project_status',
          label: '项目状态',
          value: 'approved',
          type: 'badge',
          badgeColor: '#52c41a',
        },
        {
          id: 'basic_info1',
          label: '基础信息',
          type: 'group',
          value: '点击展开',
          subFields: [
            {
              id: 'project_name',
              label: '项目名称',
              value: '移动端优化项目',
            },
            {
              id: 'project_type',
              label: '项目类型',
              value: 'tech_upgrade',
              type: 'select',
              valueOptions: {
                tech_upgrade: '技术改造',
                new_feature: '新功能开发',
              },
            },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <ReadOnlyForm sections={formSections} />
    </>
  );
}
