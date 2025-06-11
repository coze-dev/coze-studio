import {
  Select as BaseSelect,
  type SelectProps,
} from '@coze/coze-design';

export { type SelectProps } from '@coze/coze-design';

export const Select = (props: SelectProps) => (
  <BaseSelect size="small" {...props} />
);
