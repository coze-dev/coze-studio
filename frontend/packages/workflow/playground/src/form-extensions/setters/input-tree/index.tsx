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

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useNodeTestId } from '@coze-workflow/base';

import { withValidation } from '../../components/validation';
import { InputTree, type InputTreeProps } from '../../components/input-tree';

interface InputTreeOptions {
  id: string;
  disabled?: boolean;
  disabledTooltip?: string;
  readonly?: boolean;
  emptyPlaceholder?: string;
}
type InputTreeSetterProps = SetterComponentProps<
  InputTreeProps['value'],
  InputTreeOptions & Pick<InputTreeProps, 'columnsRatio'>
>;

const InputWithValidation = withValidation<InputTreeSetterProps>(
  ({ value, onChange, options, readonly: workflowReadonly, context }) => {
    const {
      disabled = false,
      readonly = false,
      emptyPlaceholder,
      ...props
    } = options || {};

    const { getNodeSetterId } = useNodeTestId();

    return (
      <InputTree
        {...props}
        testId={getNodeSetterId(context.path)}
        readonly={readonly || workflowReadonly}
        disabled={disabled}
        value={value}
        onChange={onChange}
        emptyPlaceholder={emptyPlaceholder}
      />
    );
  },
);

export const inputTree: SetterExtension = {
  key: 'InputTree',
  component: InputWithValidation,
};
