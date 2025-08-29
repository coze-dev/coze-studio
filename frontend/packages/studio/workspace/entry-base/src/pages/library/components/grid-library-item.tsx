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
import { I18n } from '@coze-arch/i18n';
import {
  PublishStatus,
  type ResourceInfo,
  type ResType,
} from '@coze-arch/bot-api/plugin_develop';
import { formatDate } from '@coze-arch/bot-utils';
import placeholderImg from '../../../../../entry-adapter/src/pages/falcon/assets/placeholder.png';
import { type LibraryEntityConfig } from '../types';
import { getResTypeLabelFromConfigMap } from '../hooks/use-columns';
import iconTime from '../assets/icon_time.svg';

export const GridLibraryItem: React.FC<{
  resourceInfo: ResourceInfo;
  defaultIcon?: string;
  customAvatar?: ReactNode;
  tag?: ReactNode;
  entityConfigs: LibraryEntityConfig[];
  reloadList: () => void;
  gridItemWidth?: number;
}> = ({
  resourceInfo,
  defaultIcon,
  customAvatar,
  tag,
  entityConfigs,
  reloadList,
  gridItemWidth,
}) => {
  const config =
    resourceInfo.res_type !== undefined
      ? entityConfigs.find(c =>
          c.target.includes(resourceInfo.res_type as ResType),
        )
      : undefined;
  return (
    <div className="flex-col">
      <div
        className="w-full h-[122px] px-[25px] py-[25px] bg-[#F9FAFD] rounded-[6px]"
        style={{
          background: `#F9FAFD url("${placeholderImg}") no-repeat center center / 72px auto`,
        }}
      >
        <div
          className="w-full h-full"
          style={{
            background: `url("${resourceInfo.icon || defaultIcon}") no-repeat center center / contain`,
            cursor: 'pointer',
          }}
        />
      </div>
      <div className="flex flex-col gap-[2px] mt-[10px]">
        <div className="h-[20px] flex-shrink-0">
          <Space spacing={4} className="w-full">
            <Typography.Text
              data-testid="workspace.library.item.name"
              className="h-[20px] text-[16px] coz-fg-primary leading-[20px]"
              style={{
                maxWidth: gridItemWidth ? `${gridItemWidth - 64}px` : '',
              }}
              ellipsis={{ showTooltip: true }}
            >
              <span className="font-[600]">{resourceInfo.name}</span>
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
          <div className="flex-shrink leading-[0] mt-[12px] flex-1">
            <Space spacing={4}>
              {tag}
              {resourceInfo.desc ? (
                <Typography.Text
                  data-testid="workspace.library.item.desc"
                  fontSize="12px"
                  className="!h-[16px] !font-[400] !coz-fg-secondary !leading-[16px] break-words"
                  ellipsis={{ showTooltip: true }}
                  style={{
                    maxWidth: gridItemWidth ? `${gridItemWidth - 64}px` : '',
                  }}
                >
                  {resourceInfo.desc}
                </Typography.Text>
              ) : null}
            </Space>
          </div>
        ) : (
          <div className="mt-[12px] h-[16px]" />
        )}
        <div className="flex items-center text-[12px] coz-fg-secondary mt-[8px]">
          <img
            src={iconTime}
            alt=""
            className="w-[14px] h-[14px] mr-[4px] block"
          />
          <div className="flex-1">
            {`${I18n.t('library_edited_time', {}, 'Edited time')}：${formatDate(Number(resourceInfo.edit_time), 'YYYY-MM-DD HH:mm')}`}
          </div>
          <div className="px-[8px] py-[2px] rounded-[4px] bg-[#F2F5FA] text-[#4D5E77]">
            {getResTypeLabelFromConfigMap(resourceInfo, entityConfigs)}
          </div>
        </div>
      </div>
      <div
        data-testid="workspace.library.item.actions"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {config?.renderActions(resourceInfo, reloadList) ?? null}
      </div>
    </div>
  );
};
