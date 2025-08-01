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
import { useNodeTestId, type RefExpression } from '@coze-workflow/base';

import { LoopOutputSelect as LoopOutputSelectComponent } from '@/form-extensions/components/loop-output-select';

import { valueExpressionValidator } from '../../validators';

type LoopOutputSelectSetterProps = SetterComponentProps<RefExpression>;

export function LoopOutputSelectSetter(
  props: LoopOutputSelectSetterProps,
): JSX.Element {
  const { value, onChange, readonly, context } = props;

  const { getNodeSetterId } = useNodeTestId();
  const testId = getNodeSetterId(context?.path);

  return (
    <LoopOutputSelectComponent
      value={value}
      onChange={onChange}
      readonly={readonly}
      testId={testId}
    />
  );
}

export const LoopOutputSelect = {
  key: 'LoopOutputSelect',
  component: LoopOutputSelectSetter,
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
