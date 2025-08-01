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

import { type FC, useState } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown, IconCozLoading } from '@coze-arch/coze-design/icons';
import { Typography } from '@coze-arch/coze-design';

import styles from './styles.module.less';
export const LoadMoreCard: FC<{
  onLoadMore: () => Promise<void>;
}> = ({ onLoadMore }) => {
  const [loading, setLoading] = useState(false);
  return (
    <div
      className={styles['load-more']}
      onClick={async () => {
        try {
          setLoading(true);
          await onLoadMore?.();
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className={styles['load-more-icon']}>
        {loading ? (
          <IconCozLoading
            className={classNames(styles.icon, 'semi-spin-animate')}
          />
        ) : (
          <IconCozArrowDown className={styles.icon} />
        )}
      </div>
      <Typography.Text className={styles['load-more-text']}>
        {I18n.t('workflow_0224_05')}
      </Typography.Text>
    </div>
  );
};
