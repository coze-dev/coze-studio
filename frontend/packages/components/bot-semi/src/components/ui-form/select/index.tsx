import { ComponentProps } from 'react';

import { SelectProps } from '@douyinfe/semi-ui/lib/es/select';
import { CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { UISelect } from '../../ui-select';

// UISelect 的 label 属性是提供给 borderless 主题使用的 表单场景下没有此主题，去掉这个属性避免和 form label 混合
const SelectInner: React.FC<
  Omit<ComponentProps<typeof UISelect>, 'label'>
> = props => <UISelect {...props} />;

const FormSelectInner = withField(SelectInner);

export const UIFormSelect: React.FC<
  Omit<SelectProps, 'theme'> & CommonFieldProps
> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  OptGroup: typeof UISelect.OptGroup;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Option: typeof UISelect.Option;
} = ({ ...props }) => <FormSelectInner {...props} theme="light" />;

UIFormSelect.Option = UISelect.Option;
UIFormSelect.OptGroup = UISelect.OptGroup;
