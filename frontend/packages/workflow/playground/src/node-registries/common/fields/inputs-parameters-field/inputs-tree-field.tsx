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

import { type InputValueVO } from '@coze-workflow/base';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ValidationProps } from '@/nodes-v2/components/validation/with-validation';
import { withValidation } from '@/nodes-v2/components/validation';
import {
  InputTree,
  type InputTreeProps,
} from '@/form-extensions/components/input-tree';
import { useField, withField, type FieldProps } from '@/form';

interface InputsTreeFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  customReadonly?: boolean;
  testId?: string;
}

const InputTreeWithValidation = withValidation(
  (props: InputTreeProps & ValidationProps) => <InputTree {...props} />,
);

export const InputsTreeField = withField(
  ({ title, tooltip, customReadonly, testId }: InputsTreeFieldProps) => {
    const { value, onChange, errors } = useField<InputValueVO[]>();
    const formReadonly = useReadonly();
    const readonly = formReadonly || customReadonly;
    return (
      <InputTreeWithValidation
        value={value}
        title={title}
        titleTooltip={tooltip}
        readonly={readonly}
        onChange={onChange}
        errors={errors}
        testId={testId}
      />
    );
  },
  {
    hasFeedback: false,
  },
);
