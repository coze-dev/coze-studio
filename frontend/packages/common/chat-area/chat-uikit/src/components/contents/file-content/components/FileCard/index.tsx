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

import classNames from 'classnames';
import {
  IconCozCopy,
  IconCozCross,
  IconCozRefresh,
} from '@coze-arch/coze-design/icons';
import { IconButton, Typography } from '@coze-arch/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { UIKitTooltip } from '../../../../common/tooltips';
import { getFileExtensionAndName } from '../../../../../utils/file-name';
import { convertBytes } from '../../../../../utils/convert-bytes';
import {
  typeSafeFileCardNameVariants,
  typeSafeFileCardVariants,
} from './variants';
import { type IFileCardProps } from './type';
import {
  FAIL_FILE_ICON_MAP,
  FILE_CARD_WIDTH,
  PERCENT_DENOMINATOR,
  SUCCESS_FILE_ICON_MAP,
} from './constants';

import './file-card.less';

// eslint-disable-next-line @coze-arch/max-line-per-function
const FileCard: FC<IFileCardProps> = props => {
  const {
    file,
    attributeKeys,
    tooltipsCopywriting,
    readonly,
    onCancel,
    onCopy,
    onRetry,
    className,
    layout,
    showBackground,
  } = props;

  const { statusKey, statusEnum, percentKey } = attributeKeys;

  const percent = file[percentKey];

  const fileIconMap = [statusEnum.cancelEnum, statusEnum.failEnum].includes(
    file[statusKey],
  )
    ? FAIL_FILE_ICON_MAP
    : SUCCESS_FILE_ICON_MAP;

  const buttonsVisible = !readonly;
  const { extension, nameWithoutExtension } = getFileExtensionAndName(
    file.file_name,
  );

  const isCanceled = file[statusKey] === statusEnum.cancelEnum;

  return (
    <div
      // className={classNames(className, 'chat-uikit-file-card', {
      //   'chat-uikit-file-card--error': file[statusKey] === statusEnum.failEnum,
      //   'chat-uikit-file-card-pc': layout === Layout.PC,
      //   'chat-uikit-file-card-mobile': layout === Layout.MOBILE,
      //   '!coz-bg-image-bots !coz-stroke-image-bots':
      //     showBackground && file[statusKey] !== statusEnum.failEnum,
      // })}
      className={classNames(
        typeSafeFileCardVariants({
          isError: file[statusKey] === statusEnum.failEnum,
          layout: layout === Layout.PC ? 'pc' : 'mobile',
          showBackground,
        }),
        className,
      )}
    >
      <img
        src={fileIconMap[file.file_type]}
        // chat-uikit-file-card__icon
        className="h-[32px] w-[32px]"
      ></img>
      <div
        // chat-uikit-file-card__info
        className="flex flex-1 flex-col ml-8px overflow-hidden"
      >
        <Typography.Text
          ellipsis={{
            showTooltip:
              layout === Layout.MOBILE
                ? false
                : {
                    opts: {
                      content: file.file_name,
                      style: { wordWrap: 'break-word' },
                    },
                  },
            suffix: extension,
          }}
          // chat-uikit-file-card__info__name
          // chat-uikit-file-card__info__name_pc
          // chat-uikit-file-card__info__name_mobile
          className={typeSafeFileCardNameVariants({
            isCanceled,
            layout: layout === Layout.PC ? 'pc' : 'mobile',
          })}
        >
          {nameWithoutExtension}
        </Typography.Text>
        <span
          // chat-uikit-file-card__info__size
          className={classNames(
            'text-base font-normal leading-[16px]',
            isCanceled ? 'coz-fg-dim' : 'coz-fg-secondary',
          )}
        >
          {convertBytes(file.file_size)}
        </span>
      </div>
      {buttonsVisible ? (
        <>
          <div
            // chat-uikit-file-card__buttons
            className="ml-8px"
          >
            {file[statusKey] === statusEnum.uploadingEnum && (
              <UIKitTooltip
                theme="light"
                position="top"
                content={tooltipsCopywriting?.cancel}
                hideToolTip={layout === Layout.MOBILE}
              >
                <IconButton
                  // chat-uikit-file-card__buttons__button
                  icon={
                    <IconCozCross // chat-uikit-file-card__buttons__icon
                    />
                  }
                  size="small"
                  color="secondary"
                  onClick={onCancel}
                />
              </UIKitTooltip>
            )}
            {[statusEnum.cancelEnum, statusEnum.failEnum].includes(
              file[statusKey],
            ) && (
              <UIKitTooltip
                theme="light"
                position="top"
                content={tooltipsCopywriting?.retry}
                hideToolTip={layout === Layout.MOBILE}
              >
                <IconButton
                  // chat-uikit-file-card__buttons__button

                  icon={
                    <IconCozRefresh // chat-uikit-file-card__buttons__icon
                    />
                  }
                  size="small"
                  color="secondary"
                  onClick={onRetry}
                />
              </UIKitTooltip>
            )}
            {file[statusKey] === statusEnum.successEnum && (
              <UIKitTooltip
                theme="light"
                position="top"
                content={tooltipsCopywriting?.copy}
                hideToolTip={layout === Layout.MOBILE}
              >
                <IconButton
                  // chat-uikit-file-card__buttons__button

                  icon={
                    <IconCozCopy // chat-uikit-file-card__buttons__icon
                    />
                  }
                  size="small"
                  color="secondary"
                  onClick={onCopy}
                />
              </UIKitTooltip>
            )}
          </div>
          {file[statusKey] === statusEnum.uploadingEnum && (
            <div
              // chat-uikit-file-card__progress-wrap
              className={classNames(
                // TODO: ui supplement progress bar color
                'coz-fg-hglt-dim absolute top-0 left-0 w-[280px] h-[72px]',
                'chat-uikit-file-card-progress-animation',
              )}
              style={{
                width: `${FILE_CARD_WIDTH * (percent / PERCENT_DENOMINATOR)}px`,
              }}
            />
          )}
        </>
      ) : null}
    </div>
  );
};

FileCard.displayName = 'FileCard';

export default FileCard;
