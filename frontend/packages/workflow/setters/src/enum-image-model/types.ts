import { type SelectProps } from '@coze/coze-design';

export type Value = string | number | undefined;

export interface EnumImageModelOptionsOption {
  thumbnail: string;
  tooltip?: string;
  value: Value;
  label: string;
  disabled?: boolean;
}

export interface EnumImageModelOptions {
  width?: string | number;
  showClear?: boolean;
  placeholder?: string;
  options: EnumImageModelOptionsOption[];
  validateStatus?: SelectProps['validateStatus'];
}

export interface EnumImageModelLabelProps {
  thumbnail: string;
  label: string;
  tooltip?: string;
  disabledTooltip?: string;
  disabled?: boolean;
}
