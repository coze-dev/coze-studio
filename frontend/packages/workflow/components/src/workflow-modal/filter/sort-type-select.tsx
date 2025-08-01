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

import { useContext } from 'react';

import { SortType } from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';
import { UISelect } from '@coze-arch/bot-semi';

import WorkflowModalContext, {
  type WorkflowModalContextValue,
} from '../workflow-modal-context';

const defaultDataSource = [
  {
    label: I18n.t('Popular', {}, '最受欢迎'),
    value: SortType.Heat,
  },
  {
    label: I18n.t('mkpl_published', {}, '最近发布'),
    value: SortType.Newest,
  },
];

const queryDataSource = [
  {
    label: I18n.t('store_search_rank_default', {}, '相关性'),
    value: SortType.Relative,
  },
].concat(defaultDataSource);

export const SortTypeSelect = () => {
  const context = useContext(WorkflowModalContext);
  const { updateModalState } = context as WorkflowModalContextValue;
  const { query, sortType } = context?.modalState || {};

  const handleOnChange = value => {
    updateModalState({ sortType: value as SortType });
  };

  return (
    <UISelect
      label={I18n.t('Sort')}
      value={sortType}
      optionList={query ? queryDataSource : defaultDataSource}
      onChange={handleOnChange}
    />
  );
};
