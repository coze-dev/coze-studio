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

import React from 'react';

import { AvatarBackgroundNoticeDot } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozImage } from '@coze-arch/coze-design/icons';
import { Button, Popconfirm } from '@coze-arch/coze-design';
import { IconEdit, IconNo } from '@coze-arch/bot-icons';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import {
  getOriginImageFromBackgroundInfo,
  useBackgroundContent,
} from '@coze-agent-ide/chat-background-shared';

import s from './index.module.less';

export interface ChatBackGroundContentProps {
  backgroundImageInfoList: BackgroundImageInfo[];
  isReadOnly: boolean;
  openConfig: () => void;
  setBackgroundImageInfoList: (value: BackgroundImageInfo[]) => void;
}

export const ChatBackGroundContent: React.FC<ChatBackGroundContentProps> = ({
  backgroundImageInfoList = [],
  isReadOnly = false,
  openConfig,
  setBackgroundImageInfoList,
}) => {
  const originImgUrl = getOriginImageFromBackgroundInfo(
    backgroundImageInfoList,
  ).url;

  const { handleEdit, showDot, showDotStatus, handleRemove } =
    useBackgroundContent({
      openConfig,
      setBackgroundImageInfoList,
    });

  return (
    <div>
      {!originImgUrl && !showDot ? (
        <div className="coz-fg-secondary text-lg">{I18n.t('bgi_desc')}</div>
      ) : (
        <div className="p-2 w-full flex items-center justify-between coz-mg-primary hover:coz-mg-primary-hovered rounded-small cursor-pointer">
          <div
            className="w-8 h-8 rounded-[6px] relative flex items-center justify-center coz-mg-primary"
            style={{
              backgroundImage: originImgUrl ? `url(${originImgUrl})` : 'none',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          >
            {showDot && !originImgUrl ? <IconCozImage /> : null}
            {showDot ? (
              <AvatarBackgroundNoticeDot status={showDotStatus} />
            ) : null}
          </div>
          {!isReadOnly && (
            <div className="flex gap-1 items-center">
              <Button
                icon={<IconEdit className={s.icon} />}
                color="primary"
                size={'mini'}
                className="!bg-transparent hover:!coz-mg-primary-hovered !p-1 !h-6 coz-fg-secondary"
                onClick={handleEdit}
              />
              <Popconfirm
                content={I18n.t('bgi_remove_popup_content')}
                okButtonColor="red"
                title={I18n.t('bgi_remove_popup_title')}
                okText={I18n.t('Remove')}
                onConfirm={handleRemove}
              >
                <Button
                  icon={<IconNo className={s.icon} />}
                  color="primary"
                  size={'mini'}
                  className={
                    '!bg-transparent hover:!coz-mg-primary-hovered !p-1 !h-6 coz-fg-secondary'
                  }
                />
              </Popconfirm>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
