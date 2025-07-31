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

import React, { useCallback } from 'react';

import { Skeleton } from '@coze-arch/coze-design';

import styles from './index.module.less';

export const useSkeleton = () => {
  const renderLoading = useCallback(
    () => (
      <Skeleton
        style={{ width: '100%', height: '100%' }}
        placeholder={
          <div className={styles['skeleton-container']}>
            <div className={styles['skeleton-item']}>
              <Skeleton.Avatar className={styles['skeleton-avatar']} />
              <div className={styles['skeleton-column']}>
                <Skeleton.Title className={styles['skeleton-name']} />
                <Skeleton.Image className={styles['skeleton-content']} />
              </div>
            </div>
            <div className={styles['skeleton-item']}>
              <Skeleton.Avatar className={styles['skeleton-avatar']} />
              <Skeleton.Image className={styles['skeleton-content-mini']} />
            </div>
            <div className={styles['skeleton-item']}>
              <Skeleton.Avatar className={styles['skeleton-avatar']} />
              <div className={styles['skeleton-column']}>
                <Skeleton.Title className={styles['skeleton-name']} />
                <Skeleton.Image className={styles['skeleton-content']} />
              </div>
            </div>
          </div>
        }
        active
        loading={true}
      />
    ),
    [],
  );
  return renderLoading;
};
