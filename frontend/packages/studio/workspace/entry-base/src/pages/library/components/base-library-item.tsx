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

import { type ReactNode } from 'react';

import { IconCozCheckMarkCircleFill } from '@coze-arch/coze-design/icons';
import { Space, Typography, CozAvatar } from '@coze-arch/coze-design';
import {
  PublishStatus,
  type ResourceInfo,
} from '@coze-arch/bot-api/plugin_develop';

export const BaseLibraryItem: React.FC<{
  resourceInfo: ResourceInfo;
  defaultIcon?: string;
  customAvatar?: ReactNode;
  tag?: ReactNode;
}> = ({ resourceInfo, defaultIcon, customAvatar, tag }) => (
  <div className="flex items-center w-full h-[48px]">
    {customAvatar ?? (
      <CozAvatar
        size="lg"
        className="overflow-hidden flex-shrink-0 mr-[12px] rounded-[12px]"
        data-testid="workspace.library.item.avatar"
        src={resourceInfo.icon || defaultIcon}
        type="bot"
      />
    )}
    <div
      className="flex flex-col gap-[2px]"
      style={{ width: 'calc(100% - 60px)' }}
    >
      <div className="w-[95%] h-[20px] flex-shrink-0">
        <Space spacing={4} className="w-full">
          <Typography.Text
            data-testid="workspace.library.item.name"
            className="h-[20px] text-[14px] font-[500] coz-fg-primary leading-[20px]"
            style={{
              maxWidth: '246px',
            }}
            ellipsis={{ showTooltip: true }}
          >
            {resourceInfo.name}
          </Typography.Text>

          {resourceInfo.publish_status === PublishStatus.Published ? (
            <IconCozCheckMarkCircleFill
              data-testid="workspace.library.item.publish.status"
              className="flex-shrink-0 w-[16px] h-[16px] coz-fg-hglt-green"
            />
          ) : null}
        </Space>
      </div>
      {tag || resourceInfo.desc ? (
        <div className="w-[95%] flex-shrink leading-[0]">
          <Space spacing={4} className="w-full">
            {tag}
            {resourceInfo.desc ? (
              <Typography.Text
                data-testid="workspace.library.item.desc"
                fontSize="12px"
                className="!h-[16px] !font-[400] !coz-fg-secondary !leading-[16px]"
                ellipsis={{ showTooltip: true }}
              >
                {resourceInfo.desc}
              </Typography.Text>
            ) : null}
          </Space>
        </div>
      ) : null}
    </div>
  </div>
);
