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

/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
import { type FC, useContext, useEffect, useMemo, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import groupBy from 'lodash-es/groupBy';
import { useInViewport, useUpdateEffect } from 'ahooks';
import { StandardNodeType } from '@coze-workflow/base/types';
import { useWorkflowStore } from '@coze-workflow/base/store';
import {
  WorkflowMode,
  WorkFlowType,
  Tag,
  BindBizType,
} from '@coze-workflow/base/api';
import { isGeneralWorkflow, workflowApi } from '@coze-workflow/base';
import { SearchNoResult } from '@coze-studio/components/search-no-result';
import { I18n } from '@coze-arch/i18n';
import { IconCozLoading } from '@coze-arch/coze-design/icons';
import { Spin } from '@coze-arch/coze-design';
import { UICompositionModalMain, UIEmpty } from '@coze-arch/bot-semi';
import {
  ProductEntityType,
  ProductListSource,
} from '@coze-arch/bot-api/product_api';

import { useWorkflowList } from '@/hooks/use-workflow-list';

import WorkflowModalContext from '../workflow-modal-context';
import { isSelectProjectCategory } from '../utils';
import {
  DataSourceType,
  MineActiveEnum,
  type ProductInfo,
  WORKFLOW_LIST_STATUS_ALL,
  WorkflowCategory,
  type WorkflowInfo,
  WorkflowModalFrom,
  type WorkFlowModalModeProps,
  type WorkflowModalState,
} from '../type';
import { useWorkflowProductList } from '../hooks/use-workflow-product-list';
import { useI18nText } from '../hooks/use-i18n-text';
import { WorkflowCard } from './card';

import s from './index.module.less';

// eslint-disable-next-line max-lines-per-function
const WorkflowModalContent: FC<WorkFlowModalModeProps> = props => {
  const { excludedWorkflowIds, from, projectId } = props;
  const context = useContext(WorkflowModalContext);
  const { i18nText, ModalI18nKey } = useI18nText();
  const {
    updatePageParam: updateWorkflowPageParam,
    isFetching,
    workflowList,
    fetchNextPage,
    loadingStatus,
    refetch,
    hasNextPage,
    handleDelete,
  } = useWorkflowList({
    pageSize: 10,
    enabled: context?.modalState.dataSourceType === DataSourceType.Workflow,
    from,
    fetchWorkflowListApi:
      context?.modalState?.workflowCategory !== WorkflowCategory.Example
        ? workflowApi.GetWorkFlowList.bind(workflowApi)
        : workflowApi.GetExampleWorkFlowList.bind(workflowApi),
  });

  const {
    workflowProductList,
    updatePageParam: updateProductPageParam,
    fetchNextPage: fetchNextProductPage,
    isFetching: productIsFetching,
    loadingStatus: productLoadingStatus,
    hasNextPage: productHasNextPage,
    copyProduct,
  } = useWorkflowProductList({
    pageSize: 10,
    enabled: context?.modalState.dataSourceType === DataSourceType.Product,
  });
  // conversion filter parameters
  useEffect(() => {
    if (!context) {
      return;
    }

    const { modalState, flowMode } = context;

    if (modalState.dataSourceType === DataSourceType.Workflow) {
      const isAddProjectWorkflow = isSelectProjectCategory(modalState);
      let targetTags;
      if (!modalState.isSpaceWorkflow) {
        if (modalState.query) {
          targetTags = 1;
        } else {
          targetTags = modalState.workflowTag;
        }
      }
      let type: WorkFlowType;
      if (modalState.workflowCategory === WorkflowCategory.Example) {
        targetTags = Tag.All;
        type = WorkFlowType.GuanFang;
      } else {
        type = modalState.isSpaceWorkflow
          ? WorkFlowType.User
          : WorkFlowType.GuanFang;
      }
      let status: WorkflowModalState['status'] | undefined = undefined;
      if (modalState.isSpaceWorkflow) {
        status =
          // isAddProjectWorkflow: Add sub-workflow to the project, no release state concept, filter state pass undefined
          modalState.status === WORKFLOW_LIST_STATUS_ALL || isAddProjectWorkflow
            ? undefined
            : modalState.status;
      }
      updateWorkflowPageParam({
        space_id: context.spaceId,
        flow_mode: modalState.listFlowMode,
        name: modalState.query,
        order_by: modalState.isSpaceWorkflow ? context.orderBy : undefined,
        status,
        type,
        project_id: isSelectProjectCategory(modalState) ? projectId : undefined,
        login_user_create: modalState.isSpaceWorkflow
          ? modalState.creator === MineActiveEnum.Mine
          : undefined,
        tags: targetTags,
        bind_biz_type: context.bindBizType,
        bind_biz_id: context.bindBizId,
      });
    } else {
      if (modalState.productCategory === 'recommend') {
        updateProductPageParam({
          keyword: modalState.query,
          sort_type: modalState.sortType,
          category_id: undefined,
          source: ProductListSource.Recommend,
          entity_type: isGeneralWorkflow(flowMode)
            ? ProductEntityType.WorkflowTemplateV2
            : ProductEntityType.ImageflowTemplateV2,
        });
      } else if (modalState.productCategory === 'all') {
        updateProductPageParam({
          keyword: modalState.query,
          sort_type: modalState.sortType,
          category_id: undefined,
          source: undefined,
          entity_type: isGeneralWorkflow(flowMode)
            ? ProductEntityType.WorkflowTemplateV2
            : ProductEntityType.ImageflowTemplateV2,
        });
      } else {
        updateProductPageParam({
          keyword: modalState.query,
          sort_type: modalState.sortType,
          category_id: modalState.productCategory,
          source: undefined,
          entity_type: isGeneralWorkflow(flowMode)
            ? ProductEntityType.WorkflowTemplateV2
            : ProductEntityType.ImageflowTemplateV2,
        });
      }
    }
  }, [context]);

  const { nodes } = useWorkflowStore(
    useShallow(state => ({
      nodes: state.nodes,
    })),
  );

  // Subprocess node map, e.g. {'workflowId': [node1, node2,...]}
  const workflowNodesMap = useMemo(() => {
    const subFlowNodes = nodes.filter(
      v => v.type === StandardNodeType.SubWorkflow,
    );
    const groups = groupBy(
      subFlowNodes,
      item => item?.data?.inputs?.workflowId,
    );
    return groups;
  }, [nodes]);

  const targetWorkflowList = useMemo(() => {
    if (!excludedWorkflowIds) {
      return workflowList;
    }
    return workflowList.filter(
      v => !excludedWorkflowIds.includes(v.workflow_id || ''),
    );
  }, [excludedWorkflowIds, workflowList]);

  /** Scroll container */
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  /** Monitor the bottom observer */
  const intersectionObserverDom = useRef<HTMLDivElement>(null);
  // Is it bottoming out?
  const [inViewPort] = useInViewport(intersectionObserverDom, {
    root: () => scrollContainerRef.current,
    threshold: 0.8,
  });

  // The first effect is not executed, this is the effect of switching the state
  useUpdateEffect(() => {
    // When the filter item changes, return to the top
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
      });
    }
    // Perform this effect whenever a non-page change is made in the query
  }, [context?.modalState]);

  // Get next page logic
  useEffect(() => {
    if (!inViewPort) {
      return;
    }

    if (dataSourceType === DataSourceType.Workflow) {
      if (loadingStatus !== 'success' || isFetching || !hasNextPage) {
        return;
      }
      fetchNextPage();
    } else {
      if (
        productLoadingStatus !== 'success' ||
        productIsFetching ||
        !productHasNextPage
      ) {
        return;
      }
      fetchNextProductPage();
    }
  }, [
    inViewPort,
    loadingStatus,
    isFetching,
    hasNextPage,
    productLoadingStatus,
    productIsFetching,
    productHasNextPage,
  ]);

  useEffect(() => {
    if (!context?.modalState.isSpaceWorkflow) {
      return;
    }

    const visibilityChangeHandler = () => {
      const needRefresh = document.visibilityState === 'visible';
      if (needRefresh) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeHandler);
    return () => {
      document.removeEventListener('visibilitychange', visibilityChangeHandler);
    };
  }, [context?.modalState.isSpaceWorkflow, refetch]);

  if (!context) {
    return null;
  }

  function isTypeWorkflow(
    _target: WorkflowInfo | ProductInfo,
  ): _target is WorkflowInfo {
    return context?.modalState.dataSourceType === DataSourceType.Workflow;
  }

  const { modalState, flowMode } = context;
  const { dataSourceType } = context.modalState;

  const targetLoadingStatus =
    dataSourceType === DataSourceType.Workflow
      ? loadingStatus
      : productLoadingStatus;
  const targetHasNextPage =
    dataSourceType === DataSourceType.Workflow
      ? hasNextPage
      : productHasNextPage;
  const targetList =
    dataSourceType === DataSourceType.Workflow
      ? targetWorkflowList
      : workflowProductList;

  const isAgentWorkflow = from === WorkflowModalFrom.WorkflowAgent;
  const renderEmpty = () => {
    const isNotFound = Boolean(modalState.query);
    if (flowMode === WorkflowMode.SceneFlow) {
      return (
        <SearchNoResult
          title={i18nText(ModalI18nKey.CreatedListEmptyTitle)}
          type={'social-scene-flow'}
          isNotFound={isNotFound}
          notFound={isNotFound ? i18nText(ModalI18nKey.ListEmptyTitle) : ''}
        />
      );
    } else {
      return (
        <UIEmpty
          isNotFound={isNotFound}
          notFound={{
            title: i18nText(ModalI18nKey.ListEmptyTitle),
          }}
          empty={{
            title: i18nText(ModalI18nKey.CreatedListEmptyTitle),
            description: i18nText(ModalI18nKey.CreatedListEmptyDescription),
          }}
        />
      );
    }
  };
  return (
    <UICompositionModalMain>
      <Spin
        spinning={targetLoadingStatus === 'pending'}
        wrapperClassName={s.spin}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Workflow as agent support for adding dialog flows with custom imported parameters */}
        {/* {isAgentWorkflow ? (
          <div className="coz-mg-hglt px-[36px] py-[8px] mx-[24px] my-[0] rounded-[8px]">
            {I18n.t('wf_chatflow_133')}
          </div>
        ) : null} */}
        <div
          className={`${s['workflow-content']} new-workflow-modal-content`}
          ref={scrollContainerRef}
        >
          {/* content rendering */}
          {targetLoadingStatus !== 'pending' && targetList.length > 0 && (
            <UICompositionModalMain.Content
              style={{
                minHeight: '100%',
                paddingBottom: isAgentWorkflow ? '60px' : 0,
              }}
            >
              {/* Data rendering style, list style/card style. Use card style when displaying image stream item lists */}
              <>
                {targetList.map((item: WorkflowInfo | ProductInfo) => (
                  <WorkflowCard
                    key={
                      isTypeWorkflow(item)
                        ? item.workflow_id
                        : item.meta_info.entity_id
                    }
                    data={item}
                    itemShowDelete={
                      context?.bindBizType === BindBizType.DouYinBot
                    }
                    workflowNodes={
                      isTypeWorkflow(item)
                        ? workflowNodesMap[item.workflow_id || ''] ?? []
                        : []
                    }
                    handleDeleteWorkflow={handleDelete}
                    copyProductHandle={copyProduct}
                    {...props}
                  />
                ))}
              </>

              {targetHasNextPage ? (
                <div ref={intersectionObserverDom}>
                  <div className={s['loading-more']}>
                    <IconCozLoading className="animate-spin coz-fg-dim mr-[4px]" />
                    <div>{I18n.t('Loading')}</div>
                  </div>
                </div>
              ) : null}
            </UICompositionModalMain.Content>
          )}
          {targetLoadingStatus === 'success' &&
            targetList.length === 0 &&
            renderEmpty()}
        </div>
      </Spin>
    </UICompositionModalMain>
  );
};

export { WorkflowModalContent };
