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

import { useParams } from 'react-router-dom';
import React, { useMemo } from 'react';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Typography, Space } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface ResultWordInterface {
  isMobile?: boolean;
}

export const ResultWord = (props: ResultWordInterface) => {
  const { isMobile = false } = props;
  const { word } = useParams();

  const queryWordShow = useMemo(() => {
    try {
      return decodeURIComponent(word ?? '');
    } catch (err) {
      return word;
    }
  }, [word]);
  return (
    <Space
      spacing={8}
      className={cls(styles.container, { [styles.isMobile]: isMobile })}
    >
      <Typography.Text className={styles.result} ellipsis={{ rows: 1 }}>
        {I18n.t('store_search_suggest_result', {
          query: queryWordShow,
        })}
      </Typography.Text>
    </Space>
  );
};
