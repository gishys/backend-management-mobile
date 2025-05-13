import { fetchMyWkInstance } from '@/api/workflow/instance';
import FormViewer from '@/components/form/FormViewer';
import ReadOnlyForm from '@/components/form/ReadOnlyForm';
import { FormSection } from '@/types/workflow/form/form.types';
import { WorkflowInstance } from '@/types/workflow/instance/processInstance.types';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button } from 'react-native';

export default function ProcessDetails() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const [formSections, setFormSections] = useState<FormSection[]>([]);
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
  useEffect(() => {
    (async () => {
      console.log(params);
      const wkInstance = await fetchMyWkInstance({
        workflowId: params.wkInstanceId.toString(),
      });
      if (wkInstance as WorkflowInstance) {
        const instance = wkInstance as WorkflowInstance;
        if (instance.currentExecutionPointer?.extensionAttributes?.form_data) {
          setFormSections(
            instance.currentExecutionPointer.extensionAttributes.form_data,
          );
        }
      }
    })();
  }, []);
  return (
    <>
      <FormViewer sections={formSections} />
    </>
  );
}
