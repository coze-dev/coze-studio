import { type ComponentProps } from 'react';

import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { type CommonFieldProps } from '@/components/semi/types';
import { Select, type SelectProps } from '@/components/select';

import { formFieldClassName } from '../form.variant';

// UISelect 的 label 属性是提供给 borderless 主题使用的 表单场景下没有此主题，去掉这个属性避免和 form label 混合
const SelectInner: React.FC<
  Omit<ComponentProps<typeof Select>, 'label'>
> = props => <Select {...props} />;

const FormSelectInner = withField(SelectInner);

export const FormSelect: React.FC<SelectProps & CommonFieldProps> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  OptGroup: typeof Select.OptGroup;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Option: typeof Select.Option;
} = ({ fieldClassName, ...props }) => (
  <FormSelectInner
    {...props}
    fieldClassName={cn(formFieldClassName(), fieldClassName)}
  />
);

FormSelect.Option = Select.Option;
FormSelect.OptGroup = Select.OptGroup;
