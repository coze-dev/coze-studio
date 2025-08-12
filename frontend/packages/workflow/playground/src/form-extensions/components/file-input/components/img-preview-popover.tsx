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

import { useState, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Popover, Image } from '@coze-arch/coze-design';
import { IconImageOverlay } from '@coze-arch/bot-icons';

import {
  type FileItem,
  getFileExtension,
  PREVIEW_IMAGE_TYPE,
} from '@/hooks/use-upload';

import styles from './index.module.less';

const ImagePreviewer = ({ file }) => {
  const [loadError, setLoadError] = useState(false);

  return (
    <>
      {loadError ? (
        <div
          className="flex flex-col items-center justify-center"
          style={{ width: 225, height: 125 }}
        >
          <IconImageOverlay className="w-8 coz-fg-dim" />
          <div className="mt-1 coz-fg-primary text-sm font-medium">
            {I18n.t('inifinit_list_load_fail')}
          </div>
        </div>
      ) : (
        <div
          className={classNames(
            'flex flex-col items-center justify-center rounded-lg overflow-hidden',
            !loadError ? 'cursor-zoom-in' : 'cursor-default',
          )}
          style={{
            minWidth: 100,
            minHeight: 75,
            background: 'rgba(46, 46, 56, 0.08)',
          }}
        >
          <Image
            className={classNames(
              'object-contain object-center rounded-sm w-full h-full',
            )}
            imgStyle={{ maxWidth: 400, maxHeight: 300 }}
            src={file?.url}
            onLoad={() => {
              setLoadError(false);
            }}
            onError={() => {
              setLoadError(true);
            }}
          />
        </div>
      )}
    </>
  );
};

export const ImgPreviewPopover = (
  props: PropsWithChildren<{ file?: FileItem }>,
): JSX.Element => {
  const { file, children } = props;

  const fileType = getFileExtension(file?.name);

  if (PREVIEW_IMAGE_TYPE.includes(fileType)) {
    return (
      <Popover
        position="top"
        className={styles['img-popover-content']}
        showArrow
        content={<ImagePreviewer file={file} />}
      >
        {children}
      </Popover>
    );
  }

  return <>{children}</>;
};
