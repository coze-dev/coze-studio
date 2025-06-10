export interface FormItemMeta {
  name: string;
  label: string;
  required?: boolean;
  setter: string;
  setterProps?: {
    defaultValue?: unknown;
    [k: string]: unknown;
  };
  layout?: 'horizontal' | 'vertical';
}

export type FormMeta = FormItemMeta[];

export interface DynamicComponentProps<T> {
  value?: T; // 字段值
  readonly?: boolean; // 是否只读
  disabled?: boolean; // 是否禁用
  onChange: (newValue?: T) => void;
}
