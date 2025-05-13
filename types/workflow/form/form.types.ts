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
  valueOptions?: Record<string, string>; // 用于select的字典
  subFields?: FormField[]; // 子字段
  badgeColor?: string; // 自定义徽章颜色
}

export interface FormSection {
  id: string;
  title: string;
  sort?: number;
  description?: string;
  fields: FormField[];
}
