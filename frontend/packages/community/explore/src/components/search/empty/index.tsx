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

import { SearchNoResult } from '@coze-studio/components/search-no-result';
import { type EmptyProps } from '@coze-community/components';
import { ResponsiveList } from '@coze-arch/responsive-kit';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { SearchSkeleton } from '../search-card';
import { type ValidEntityType } from '../../../pages/search/type';
import { gridResponsiveNumMap } from '../../../pages/search/config';

export const renderEmpty = (
  { isLoading, loadRetry, isError }: EmptyProps,
  entityType: ValidEntityType,
) => {
  if (isError) {
    return (
      <SearchNoResult
        type="recommend"
        isNotFound={false}
        title={I18n.t('inifinit_list_load_fail')}
        cardPosition="bottom"
        button={
          loadRetry ? (
            <Button
              size="large"
              color="highlight"
              type="primary"
              theme="solid"
              onClick={() => {
                loadRetry?.();
              }}
            >
              {I18n.t('inifinit_list_retry')}
            </Button>
          ) : null
        }
      />
    );
  } else if (!isLoading) {
    return (
      <SearchNoResult
        type="recommend"
        isNotFound={false}
        title={I18n.t('store_search_suggest_no_result')}
        cardPosition="bottom"
      />
    );
  }
  return (
    <ResponsiveList
      gridGapYs={{
        basic: 4,
      }}
      dataSource={Array(24).fill(0)}
      renderItem={(_, idx) => (
        <SearchSkeleton key={idx} entityType={entityType} />
      )}
      gridGapXs={{
        basic: 4,
      }}
      gridCols={gridResponsiveNumMap[entityType]}
    />
  );
};
