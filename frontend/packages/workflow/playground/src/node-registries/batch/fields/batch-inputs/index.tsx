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

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { type FC } from 'react';

import { type InputValueVO, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { InputsField } from '@/node-registries/common/fields';

import { BatchPath } from '../../constants';

interface BatchInputsFieldProps {
  name?: string;
}

export const BatchInputsField: FC<BatchInputsFieldProps> = ({ name }) => (
  <InputsField
    name={name ?? BatchPath.Inputs}
    title={I18n.t('workflow_batch_inputs')}
    tooltip={I18n.t('workflow_batch_inputs_tooltips')}
    defaultValue={[{ name: 'input' } as InputValueVO]}
    nthCannotDeleted={1}
    inputProps={{
      hideDeleteIcon: true,
      disabledTypes: ViewVariableType.getComplement(
        ViewVariableType.getAllArrayType(),
      ),
    }}
  />
);
