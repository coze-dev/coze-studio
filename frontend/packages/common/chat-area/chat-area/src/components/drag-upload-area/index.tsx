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

import classNames from 'classnames';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';

import { usePreference } from '../../context/preference';
import { useDragUploadContext } from '../../context/drag-upload';

import styles from './index.module.less';

const UploadIllustrationContent = () => (
  <div className={styles['upload-illustration-content']}>
    <IllustrationNoContent className={styles.illustration} />
    <div className={styles.title}>Upload the file</div>
    <div className={styles.description}>
      Drop files here to add to the conversation
    </div>
  </div>
);

export const DragUploadArea = () => {
  const { enableDragUpload } = usePreference();

  const { isDragOver } = useDragUploadContext();

  if (!enableDragUpload) {
    return null;
  }

  return (
    <div className={classNames(styles.area, isDragOver && styles['drag-over'])}>
      {isDragOver ? <UploadIllustrationContent /> : null}
    </div>
  );
};
