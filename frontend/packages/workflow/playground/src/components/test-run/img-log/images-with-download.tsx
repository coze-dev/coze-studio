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

import { I18n } from '@coze-arch/i18n';
import { UIButton } from '@coze-arch/bot-semi';
import { IconDownloadStroked } from '@douyinfe/semi-icons';

import { useImages } from './use-images';
import { Images } from './images';

import styles from './index.module.less';

export const ImagesWithDownload = () => {
  const { images, downloadImages } = useImages();

  return (
    <div className={styles.container}>
      {images.length > 0 && (
        <>
          <UIButton
            className={styles.downloadImages}
            type="primary"
            theme="borderless"
            onClick={downloadImages}
            icon={<IconDownloadStroked />}
          >
            {I18n.t('imageflow_output_display_save')}
          </UIButton>
          <Images images={images} />
        </>
      )}
    </div>
  );
};
