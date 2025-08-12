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
  type ValidatorProps,
} from '@flowgram-adapter/free-layout-editor';
import { type RefExpression, useNodeTestId } from '@coze-workflow/base';

import { MutableVariableAssign as MutableVariableAssignComponent } from '@/form-extensions/components/mutable-variable-assign';

import { valueExpressionValidator } from '../../validators';

type MutableVariableAssignSetterProps = SetterComponentProps<RefExpression>;

function MutableVariableAssignSetter(
  props: MutableVariableAssignSetterProps,
): JSX.Element {
  const { value, onChange, readonly, options, context } = props;
  const { right, inputParameters, index } = options;

  const { getNodeSetterId } = useNodeTestId();
  const testId = getNodeSetterId(context.path);

  return (
    <MutableVariableAssignComponent
      value={value}
      onChange={onChange}
      readonly={readonly}
      node={context.node}
      right={right}
      inputParameters={inputParameters}
      index={index}
      testId={testId}
    />
  );
}

export const MutableVariableAssign = {
  key: 'MutableVariableAssign',
  component: MutableVariableAssignSetter,
  validator: ({ value, context }: ValidatorProps) => {
    const { meta, playgroundContext, node } = context;
    const { required } = meta;
    return valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required,
    });
  },
};
