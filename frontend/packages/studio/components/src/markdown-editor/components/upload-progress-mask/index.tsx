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

import { I18n } from '@coze-arch/i18n';
import { Progress } from '@coze-arch/bot-semi';

import { type UploadState } from '../../type';

import styles from './index.module.less';

export const UploadProgressMask: React.FC<UploadState> = ({
  fileName,
  percent,
}) => (
  <div className={styles.mask}>
    <div className={styles.text}>
      {I18n.t('uploading_filename', { filename: fileName })}
    </div>
    <Progress className={styles.progress} percent={percent} />
  </div>
);
