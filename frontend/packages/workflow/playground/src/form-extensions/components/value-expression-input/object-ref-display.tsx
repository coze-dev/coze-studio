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

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

export const ObjectRefValueDisplay: FC<{}> = props => (
  <Tooltip
    content={I18n.t(
      'workflow_250310_14',
      undefined,
      '使用新增节点变量配置对象结构,此时无法输入',
    )}
  >
    <div
      className={'w-0 grow coz-fg-primary text-xs truncate'}
      style={{
        height: '20px',
        lineHeight: '20px',
        padding: '0 4px 0 2px',
        margin: '0 2px 0 2px',
      }}
    >
      {I18n.t('workflow_250310_15', undefined, '通过添加子节点进行配置')}
    </div>
  </Tooltip>
);
