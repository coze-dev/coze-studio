/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ComponentProps } from 'react';

import { SelectProps } from '@douyinfe/semi-ui/lib/es/select';
import { CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { UISelect } from '../../ui-select';

// The label attribute of UISelect is provided for the borderless theme. There is no such theme in the form scene. Remove this attribute to avoid mixing with the form label.
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
