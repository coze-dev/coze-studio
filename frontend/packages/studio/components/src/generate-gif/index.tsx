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

import { useParams } from 'react-router-dom';
import { type CSSProperties, useMemo } from 'react';

import classNames from 'classnames';
import { avatarBackgroundWebSocket } from '@coze-studio/bot-detail-store';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { PicType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import webSocketManager from '@coze-common/websocket-manager-adapter';
import { TextArea } from '@coze-arch/coze-design';

import { type ImageItem } from '../image-list';
import { GenerateButton } from '../generate-button';
import ImagePicker from './image-picker';

import s from './index.module.less';

interface GenerateGifProps {
  scene: 'background' | 'avatar';
  image: ImageItem; // default image
  text: string; // default text
  loading: boolean; // When generated, sockets listen globally for server level responses, so loading needs to be controlled
  imageList?: ImageItem[]; // Picture Candidate List (contains only static images)
  generatingTaskId: string; // Generating task id
  exceedMaxImageCount?: boolean;
  className?: string;
  style?: CSSProperties;
  setImage: (image: ImageItem) => void;
  setText: (text: string) => void;
  setLoading: (loading: boolean) => void;
  setGeneratingTaskId: (id: string) => void;
}

export const GenerateGif: React.FC<GenerateGifProps> = ({
  image = {
    id: '',
    img_info: {
      tar_uri: '',
      tar_url: '',
    },
  },
  text = '',
  loading,
  imageList = [],
  exceedMaxImageCount = false,
  className,
  generatingTaskId,
  style,
  setLoading,
  setImage,
  setText,
  setGeneratingTaskId,
  scene,
}) => {
  const { bot_id = '0' } = useParams<DynamicParams>();

  const { tar_url: url, tar_uri: uri } = image.img_info ?? {};
  const hasEmptyValue = !image?.img_info?.tar_url || !text?.trim();
  const filterImageList = useMemo(
    () => imageList.filter(item => item?.img_info?.tar_url !== url),
    [imageList, url],
  );
  let tooltipText = '';
  if (exceedMaxImageCount) {
    tooltipText = I18n.t('profilepicture_popup_toast_picturemax');
  }
  return (
    <div className={classNames(s.ctn, className)} style={style}>
      <ImagePicker setImage={setImage} url={url} imageList={filterImageList} />
      <div className={s['text-ctn']}>
        <TextArea
          rows={5}
          value={text}
          maxLength={400}
          className={s['text-area']}
          placeholder={I18n.t('profilepicture_popup_generategif_default')}
          onChange={value => {
            setText(value);
          }}
        />
        <GenerateButton
          scene="gif"
          className={s['generate-btn']}
          disabled={exceedMaxImageCount || hasEmptyValue}
          tooltipText={tooltipText}
          loading={loading}
          onClick={async () => {
            setLoading?.(true);
            try {
              avatarBackgroundWebSocket.createConnection();
              // Only responsible for sending requests, responses are received in WebSocket
              const { data } = await PlaygroundApi.GeneratePic({
                gen_prompt: {
                  ori_prompt: text.trim(),
                },
                image_uri: uri,
                image_url: url,
                pic_type:
                  scene === 'avatar' ? PicType.IconGif : PicType.BackgroundGif,
                bot_id,
                device_id: webSocketManager.deviceId,
              });
              if (data?.task_id) {
                setGeneratingTaskId?.(data.task_id);
              }
            } catch (error) {
              logger.error({
                eventName: 'fail_to_generate_gif',
                error: error as Error,
              });
              setLoading?.(false);
              setGeneratingTaskId?.('');
            }
          }}
          onCancel={async () => {
            if (generatingTaskId) {
              try {
                const { code } = await PlaygroundApi.CancelGenerateGif({
                  task_id: generatingTaskId,
                });
                if (code === 0) {
                  setLoading?.(false);
                }
              } catch (error) {
                const e =
                  error instanceof Error ? error : new Error(error as string);
                logger.error({ error: e });
              }
            }
          }}
        />
      </div>
    </div>
  );
};
