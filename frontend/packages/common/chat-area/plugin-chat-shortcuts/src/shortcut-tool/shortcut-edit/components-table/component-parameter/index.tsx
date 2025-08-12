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

import React, { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { Typography } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { type ToolInfo } from '@coze-arch/bot-api/playground_api';

const { Text } = Typography;

export interface ComponentParameterProps {
  toolInfo: ToolInfo;
  parameter: string;
}
export const ComponentParameter: FC<ComponentParameterProps> = ({
  toolInfo,
  parameter,
}) => {
  const { tool_params_list = [] } = toolInfo;
  const { name, type, required, desc } =
    tool_params_list.find(item => item.name === parameter) || {};
  return (
    <div className="px-2 flex items-center justify-center coz-fg-secondary max-w-[86px]">
      <Text className="mr-1" ellipsis>
        {name}
      </Text>
      <Tooltip
        className="max-w-[226px]"
        content={
          <div className="flex flex-col justify-center" key={name}>
            <div className="flex items-center">
              <Text
                ellipsis={{
                  showTooltip: {
                    opts: {
                      content: name || '',
                      position: 'top',
                    },
                  },
                }}
              >
                <span className="text-sm font-medium mr-[9px]">
                  {name || '-'}
                </span>
              </Text>
              <span className="rounded coz-mg-primary px-[6px] py-[1px] mr-[3px]">
                {type}
              </span>
              {Boolean(required) && (
                <span className="rounded coz-mg-primary px-[6px] py-[1px]">
                  {I18n.t('workflow_add_parameter_required')}
                </span>
              )}
            </div>
            <span className="mt-[3px] coze-fg-primary text-sm">
              {desc || '-'}
            </span>
          </div>
        }
      >
        <IconInfo />
      </Tooltip>
    </div>
  );
};
