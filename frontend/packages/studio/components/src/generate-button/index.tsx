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

import { type CSSProperties, useState, useEffect } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { AIButton, Tooltip } from '@coze-arch/coze-design';
import { PicType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import s from './index.module.less';

export interface GenerateButtonProps {
  scene?: 'gif' | 'static_image';
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'default' | 'large';
  text?: string;
  cancelText?: string;
  tooltipText?: string;
  className?: string;
  transparent?: boolean;
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  scene,
  loading = false,
  disabled: outerDisabled = false,
  tooltipText: outerTooltipText,
  className,
  transparent = false,
  style,
  onCancel,
  onClick,
  size,
  text,
  cancelText,
}) => {
  const [exceedImageGenCountLimit, setExceedImageGenCountLimit] =
    useState(false);
  const [hovering, setHovering] = useState(false);
  const handleClick = loading ? onCancel : onClick;
  const innerLoading = hovering ? false : loading;
  const disabled = exceedImageGenCountLimit || outerDisabled;
  const exceedLimitTooltipText = {
    gif: I18n.t('profilepicture_popup_toast_daymax_gif'),
    static_image: I18n.t('profilepicture_popup_toast_daymax_image'),
  };
  const tooltipText =
    exceedImageGenCountLimit && scene
      ? exceedLimitTooltipText[scene]
      : outerTooltipText;
  const getGenPicTimes = async () => {
    if (!scene) {
      return;
    }
    try {
      const { data } = await PlaygroundApi.GetGenPicTimes();
      if (data?.infos) {
        let gifCount = 0;
        let staticImageCount = 0;
        data.infos.forEach(({ type, times }) => {
          if (
            [PicType.IconGif, PicType.BackgroundGif].includes(type as PicType)
          ) {
            gifCount += times || 0;
          } else if (
            [PicType.IconStatic, PicType.BackgroundStatic].includes(
              type as PicType,
            )
          ) {
            staticImageCount += times || 0;
          }
        });
        if (
          (scene === 'gif' && gifCount >= 10) ||
          (scene === 'static_image' && staticImageCount >= 20)
        ) {
          // Limit reached, disable button
          setExceedImageGenCountLimit(true);
        }
      }
      // eslint-disable-next-line @coze-arch/no-empty-catch
    } catch (error) {
      // empty
    }
  };
  useEffect(() => {
    // Get the picture limit, limit 10 gifs and 20 static pictures per day, and judge whether the upper limit is reached according to the scene.
    if (!loading) {
      getGenPicTimes();
    }
  }, [loading]);
  const button = (
    <AIButton
      color="aihglt"
      className={classNames(s.btn, {
        [s.grey]: disabled || (loading && !hovering),
      })}
      style={
        disabled
          ? { cursor: 'not-allowed', ...style }
          : { cursor: 'pointer', ...style }
      }
      loading={innerLoading}
      size={size}
      onClick={disabled ? undefined : handleClick}
    >
      {hovering && loading
        ? cancelText || I18n.t('profilepicture_popup_cancel')
        : text || I18n.t('profilepicture_popup_generate')}
    </AIButton>
  );
  return (
    <div
      className={classNames(
        className,
        'pointer-events-auto inline-block leading-none rounded-lg',
        {
          'coz-bg-max': !transparent,
        },
      )}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {tooltipText ? <Tooltip content={tooltipText}>{button}</Tooltip> : button}
    </div>
  );
};
