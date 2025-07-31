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

import styles from './placeholder.module.less';

export function Placeholder() {
  return (
    <Skeleton
      className={styles.skeleton}
      loading={true}
      active={true}
      placeholder={
        <div className={styles.placeholder}>
          <div className={styles.hd}>
            <Skeleton.Avatar shape="square" className={styles.avatar} />
            <Skeleton.Title style={{ width: 141 }} />
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-row items-center gap-2.5">
              <Skeleton.Title style={{ width: 85 }} />
              <Skeleton.Title style={{ width: 241 }} />
            </div>
            <Skeleton.Title style={{ width: 220 }} />
          </div>
        </div>
      }
    />
  );
}
