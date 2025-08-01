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

import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { LoopOutputsField } from '@/node-registries/common/fields';

import { BatchOutputsSuffix, BatchPath } from '../../constants';

interface BatchOutputsFieldProps {
  name?: string;
  title?: string;
  tooltip?: string;
}

export const BatchOutputsField: FC<BatchOutputsFieldProps> = ({
  name = BatchPath.Outputs,
  title = I18n.t('workflow_batch_outputs'),
  tooltip = I18n.t('workflow_batch_outputs_tooltips'),
}) => (
  <LoopOutputsField
    name={name}
    title={title}
    tooltip={tooltip}
    defaultValue={[{ name: 'output' } as InputValueVO]}
    nameProps={{
      initValidate: true,
      suffix: BatchOutputsSuffix,
    }}
  />
);
