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
      /** 搜索最大字符数 */
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
      // 搜索时如果有标签, 重置全部
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
          // 如果search清空了，那么立即更新query
          cancel();
          updateSearchQuery('');
        } else {
          // 如果search有值，那么防抖更新
          debounceChangeSearch(search);
        }
      }}
    />
  );
}
