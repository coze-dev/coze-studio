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

import { Skeleton } from '@coze-arch/bot-semi';

import styles from './index.module.less';

export const NodePlaceholder = () => (
  <Skeleton
    loading={true}
    active={true}
    placeholder={
      <div className={styles.placeholder}>
        <div className={styles.hd}>
          <div className={styles.line}>
            <Skeleton.Avatar shape="square" className={styles.avatar} />
            <Skeleton.Title className={styles.title} />
          </div>
          <Skeleton.Paragraph rows={2} />
        </div>
        <Skeleton.Paragraph className={styles.paragraph} rows={2} />
        <Skeleton.Paragraph className={styles.paragraph} rows={2} />
        <div
          className={`${styles.paragraph} ${styles['last-paragraph']}`}
        ></div>
      </div>
    }
  />
);
