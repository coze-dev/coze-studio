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

import { LoopOutputsField as LoopOutputsCommonField } from '@/node-registries/common/fields';

import { LoopOutputsSuffix, LoopPath } from '../../constants';
import { formatLoopOutputName } from './format-loop-output-name';

interface LoopOutputsFieldProps {
  name?: string;
  title?: string;
  tooltip?: string;
}

export const LoopOutputsField: FC<LoopOutputsFieldProps> = ({
  name = LoopPath.LoopOutputs,
  title = I18n.t('workflow_loop_output'),
  tooltip = I18n.t('workflow_loop_output_tips'),
}) => (
  <LoopOutputsCommonField
    name={name}
    title={title}
    tooltip={tooltip}
    defaultValue={[{ name: 'output' } as InputValueVO]}
    nameProps={{
      initValidate: true,
      suffix: LoopOutputsSuffix,
      format: formatLoopOutputName,
    }}
  />
);
