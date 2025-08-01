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

import { type FC } from 'react';

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { IconCozWorkflow } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

export interface ModelInfoProps {
  showWorkflowMode?: boolean;
  name?: string;
}

const ModelInfo: FC<ModelInfoProps> = ({ showWorkflowMode, name }) => (
  <Typography.Text
    className="text-[12px] leading-[16px] coz-fg-dim"
    ellipsis={{ showTooltip: { opts: { theme: 'dark' } }, rows: 1 }}
  >
    {showWorkflowMode ? (
      <div className="flex items-center">
        <IconCozWorkflow className="mr-[2px]" />
        {I18n.t('Workflow Mode' as I18nKeysNoOptionsType)}
      </div>
    ) : (
      name
    )}
  </Typography.Text>
);

export default ModelInfo;
