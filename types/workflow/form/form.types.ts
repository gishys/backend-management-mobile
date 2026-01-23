// 类型定义增强
export type FieldType =
  | 'text'
  | 'date'
  | 'select'
  | 'badge'
  | 'group'
  | 'multiline';

export interface FormField {
  id: string;
  label: string;
  value?: string | number;
  type?: FieldType;
  required?: boolean; // 必填标识
  sort?: number; // 排序字段
  valueOptions?: Record<string, string>; // 用于select的字典
  subFields?: FormField | FormField[] | any; // 子字段：支持单个、数组或任意类型
  badgeColor?: string; // 自定义徽章颜色
  isArray?: boolean; // 是否为数组类型
}

export interface FormSection {
  id: string;
  title: string;
  sort?: number;
  description?: string;
  fields: FormField[];
}
