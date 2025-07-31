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

import React, { useContext } from 'react';

import { useDebounceFn } from 'ahooks';
import { UISearch } from '@coze-studio/components';
import { SortType } from '@coze-arch/idl/product_api';
import { I18n } from '@coze-arch/i18n';

import WorkflowModalContext from '../workflow-modal-context';
import { DataSourceType, type WorkflowModalState } from '../type';

export function useWorkflowSearch() {
  const context = useContext(WorkflowModalContext);
  const { run: debounceChangeSearch, cancel } = useDebounceFn(
    (search: string) => {
      /** Search maximum number of characters */
      const maxCount = 100;
      if (search.length > maxCount) {
        updateSearchQuery(search.substring(0, maxCount));
      } else {
        updateSearchQuery(search);
      }
    },
    { wait: 300 },
  );

  if (!context) {
    return null;
  }

  const { dataSourceType, query, isSpaceWorkflow, sortType } =
    context.modalState;

  const updateSearchQuery = (search?: string) => {
    const newState: Partial<WorkflowModalState> = { query: search ?? '' };
    if (dataSourceType === DataSourceType.Workflow) {
      // If there are tags when searching, reset all
      newState.workflowTag = isSpaceWorkflow ? 0 : 1;
      newState.sortType = undefined;
    }

    if (dataSourceType === DataSourceType.Product) {
      if (!search && sortType === SortType.Relative) {
        newState.sortType = SortType.Heat;
      }
      if (search && !context.modalState.query) {
        newState.sortType = newState.sortType = SortType.Relative;
      }
    }

    context.updateModalState(newState);
  };
  return (
    <UISearch
      tabIndex={-1}
      value={query}
      placeholder={I18n.t('workflow_add_search_placeholder')}
      data-testid="workflow.modal.search"
      onSearch={search => {
        if (!search) {
          // If the search is empty, update the query immediately
          cancel();
          updateSearchQuery('');
        } else {
          // If search has a value, then anti-shake update
          debounceChangeSearch(search);
        }
      }}
    />
  );
}
