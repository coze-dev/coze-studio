import React, { useCallback } from 'react';

import { Skeleton } from '@coze/coze-design';

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
