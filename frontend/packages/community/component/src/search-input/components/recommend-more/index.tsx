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

import { useNavigate } from 'react-router-dom';

import cls from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowRight } from '@coze-arch/coze-design/icons';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Typography } from '@coze-arch/bot-semi';

import { useSearchInputStore } from '../../search-input-store';

import styles from './index.module.less';

interface RecommendItemProps {
  onSearch?: (word: string) => void;
}

export const RecommendMore = (props: RecommendItemProps) => {
  const { onSearch } = props;
  const navigate = useNavigate();

  const { inputValue, entityTypeIn } = useSearchInputStore();

  return (
    <div
      className={cls(styles.moreContainer)}
      onMouseDown={() => {
        sendTeaEvent(EVENT_NAMES.store_search_front, {
          search_word: inputValue,
          action: 'enter_search',
        });
        console.log('[dev] mousedown:', onSearch, inputValue, entityTypeIn);
        if (onSearch) {
          onSearch(
            `/search/${encodeURIComponent(
              inputValue,
            )}?entityType=${entityTypeIn}`,
          );
        } else {
          navigate(
            `/search/${encodeURIComponent(
              inputValue,
            )}?entityType=${entityTypeIn}`,
          );
        }
      }}
    >
      <Typography.Text className={styles.text} ellipsis={{ rows: 1 }}>
        {I18n.t('store_search_suggest_page', { query: inputValue })}
      </Typography.Text>
      <IconCozArrowRight className={styles.arrow} />
    </div>
  );
};
