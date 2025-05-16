import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Button,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Formik, Field, FieldInputProps, FormikProps } from 'formik';
import * as Yup from 'yup';
import { FormField } from '@/types/workflow/form/form.types';

// 验证模式
const ValidationSchema = Yup.object().shape({
  email: Yup.string().email('无效的邮箱格式').required('邮箱为必填项'),
  password: Yup.string().min(6, '密码至少需要6个字符').required('密码为必填项'),
});

// 自定义输入组件
const CustomInput = ({
  field,
  form,
  ...props
}: {
  field: FieldInputProps<string>;
  form: FormikProps<any>;
}) => {
  const error = form.touched[field.name] && form.errors[field.name];

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={field.value}
        onChangeText={form.handleChange(field.name)}
        onBlur={form.handleBlur(field.name)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error.toString()}</Text>}
    </View>
  );
};
interface ApprovalConfirm {
  remark: string;
}
const ProForm: React.FC<{ fields: FormField[] }> = ({ fields }) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Formik<ApprovalConfirm>
          initialValues={{ remark: '' }}
          validationSchema={ValidationSchema}
          onSubmit={() => {}}
        >
          {({ handleSubmit, isSubmitting, isValid }) => (
            <View style={styles.form}>
              {fields.map((field) => {
                return (
                  <Field
                    name={field.id}
                    placeholder={`请输入${field.label}`}
                    value={field.value}
                    isRequired={field.required}
                    fieldType={field.type}
                  />
                );
              })}
              <Button
                title={isSubmitting ? '提交中...' : '登录'}
                onPress={() => {
                  handleSubmit();
                }}
                disabled={!isValid || isSubmitting}
                color="#007bff"
              />
            </View>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
};

// 样式部分
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    gap: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 5,
  },
});
export default ProForm;
