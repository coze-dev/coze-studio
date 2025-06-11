import { format as dateFormat } from 'date-fns';
import {
  type BaseValueType,
  type ValueType,
} from '@douyinfe/semi-ui/lib/es/datePicker';

export const formatValueItem = (value: BaseValueType, formatToken: string) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return dateFormat(date, formatToken);
  }
  return dateFormat(value, formatToken);
};

export const formatValue = (value: ValueType, formatToken: string) => {
  if (Array.isArray(value)) {
    return value.map(item => formatValueItem(item, formatToken));
  }
  return formatValueItem(value, formatToken);
};
