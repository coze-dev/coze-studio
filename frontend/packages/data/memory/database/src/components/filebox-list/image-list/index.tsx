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

import { type FC, useState } from 'react';

import dayjs from 'dayjs';
import { I18n } from '@coze-arch/i18n';
import { Card, CardGroup, Typography, Image } from '@coze-arch/bot-semi';
import { type FileVO } from '@coze-arch/bot-api/filebox';

import { type FileBoxListProps, FileBoxListType } from '../types';
import { type Result } from '../hooks/use-file-list';
import { ActionButtons } from '../action-buttons';

import s from './index.module.less';

export interface ImageListProps extends FileBoxListProps {
  images: FileVO[];
  reloadAsync: () => Promise<Result>;
}

export const ImageList: FC<ImageListProps> = props => {
  const { images, reloadAsync, botId, useBotStore, isStore, onCancel } = props;
  const [currentHoverCardId, setCurrentHoverCardId] = useState<string>('');
  const [isFrozenCurrentHoverCardId, setIsFrozenCurrentHoverCardId] =
    useState<boolean>(false);

  return (
    <CardGroup spacing={12} className={s['card-group']}>
      {images?.map(i => {
        const {
          // MainURL is too slow to load, the list uses ThumbnailURL for thumbnail display
          ThumbnailURL: url,
          MainURL: previewUrl,
          FileID: id,
          FileName: name,
          UpdateTime: updateTime,
        } = i || {};
        const isHover = currentHoverCardId === id;

        const onMouseEnter = () => {
          setCurrentHoverCardId(id || '');
        };

        const onMouseLeave = () => {
          if (isFrozenCurrentHoverCardId) {
            return;
          }
          setCurrentHoverCardId('');
        };

        return (
          <Card
            key={id}
            cover={
              <Image
                src={url}
                // Only set the width, and the height will be automatically scaled according to the original scale of the picture.
                width={209}
                className={s['card-cover']}
                preview={{
                  src: previewUrl,
                }}
              />
            }
            headerLine={false}
            bodyStyle={{
              padding: '12px',
            }}
            className={s.card}
          >
            <div
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              className={s['card-content']}
            >
              <Typography.Text
                className={s['photo-name']}
                ellipsis={{
                  showTooltip: true,
                }}
              >
                {name || I18n.t('filebox_0047')}
              </Typography.Text>
              <div className={s['card-footer']}>
                <Typography.Text className={s['create-time']}>
                  {dayjs.unix(Number(updateTime)).format('YYYY-MM-DD HH:mm')}
                </Typography.Text>
                {isHover ? (
                  <ActionButtons
                    record={i}
                    reloadAsync={reloadAsync}
                    type={FileBoxListType.Document}
                    setIsFrozenCurrentHoverCardId={
                      setIsFrozenCurrentHoverCardId
                    }
                    botId={botId}
                    useBotStore={useBotStore}
                    isStore={isStore}
                    onCancel={onCancel}
                  />
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </CardGroup>
  );
};
