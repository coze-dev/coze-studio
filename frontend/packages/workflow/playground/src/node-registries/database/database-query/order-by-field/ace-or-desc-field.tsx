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

import { ViewVariableType, useNodeTestId } from '@coze-workflow/base';
import { SingleSelect } from '@coze-arch/coze-design';

import { withField, useField } from '@/form';

interface AceOrDescProps {
  type?: ViewVariableType;
}

const AceOrDescLabelMap = {
  [ViewVariableType.String]: ['A → Z', 'Z → A'],
  [ViewVariableType.Integer]: ['0 → 9', '9 → 0'],
  [ViewVariableType.Number]: ['0 → 9', '9 → 0'],
  [ViewVariableType.Boolean]: ['0 → 1', '1 → 0'],
  [ViewVariableType.Time]: ['0 → 9', '9 → 0'],
};

export const AceOrDescField = withField<AceOrDescProps>(({ type }) => {
  const { name, value, onChange, readonly } = useField<boolean>();

  const { getNodeSetterId } = useNodeTestId();

  const [aceLabel, descLabel] =
    type === undefined ? [] : AceOrDescLabelMap[type];

  return (
    <SingleSelect
      layout="hug"
      disabled={readonly}
      value={`${value}`}
      onChange={e => onChange(e.target.value === 'true')}
      options={[
        {
          label: aceLabel,
          value: 'true',
        },
        {
          label: descLabel,
          value: 'false',
        },
      ]}
      size="small"
      data-testid={getNodeSetterId(name)}
    />
  );
});
