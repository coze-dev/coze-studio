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

import { useCallback, useRef, useState } from 'react';

import { useMount } from 'ahooks';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  BindBizType,
  OrderBy,
  WorkFlowListStatus,
  WorkflowMode,
  workflowQueryClient,
} from '@coze-workflow/base/api';
import { isGeneralWorkflow } from '@coze-workflow/base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  EVENT_NAMES,
  sendTeaEvent,
  FlowResourceFrom,
  FlowStoreType,
  FlowDuplicateType,
} from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import { SpaceType } from '@coze-arch/bot-api/playground_api';

import WorkflowModalContext, {
  type WorkflowModalContextValue,
} from '../workflow-modal-context';
import {
  type WorkFlowModalModeProps,
  DataSourceType,
  MineActiveEnum,
  type WorkflowModalState,
  WorkflowModalFrom,
  WorkflowCategory,
} from '../type';
import { type WorkflowFilterRef } from '../sider/workflow-filter';
import { WorkflowModalSider } from '../sider';
import styles from '../index.module.less';
import { WorkflowModalFilterForDouyin } from '../filter-douyin';
import { WorkflowModalFilter } from '../filter';
import { WorkflowModalContent } from '../content';
import { reporter } from '../../utils';
import { ModalI18nKey, WORKFLOW_MODAL_I18N_KEY_MAP } from './use-i18n-text';
/**
 * Return to the parts of the process pop-up window Components, content, sides, filter components, split components can be used for different layouts
 * This is for process selection
 */
// eslint-disable-next-line @coze-arch/max-line-per-function
export const useWorkflowModalParts = (props: WorkFlowModalModeProps) => {
  const {
    flowMode = WorkflowMode.Workflow,
    initState,
    hideSider = false,
    bindBizId,
    bindBizType,
    projectId,
    i18nMap,
    from,
  } = props;
  const { space_type: spaceType, id: spaceId } = useSpaceStore(
    state => state.space,
  );
  const sideRef = useRef<WorkflowFilterRef>(null);
  const [modalState, setModalState] = useState<WorkflowModalState>({
    status: initState?.status ?? WorkFlowListStatus.HadPublished,
    dataSourceType: initState?.dataSourceType ?? DataSourceType.Workflow,
    creator: initState?.creator ?? MineActiveEnum.All,
    workflowTag: initState?.workflowTag ?? 0,
    productCategory: initState?.productCategory ?? '',
    query: initState?.query ?? '',
    isSpaceWorkflow: initState?.isSpaceWorkflow ?? true,
    workflowCategory:
      from === WorkflowModalFrom.ProjectWorkflowAddNode
        ? WorkflowCategory.Project
        : WorkflowCategory.Library,
    listFlowMode: initState?.listFlowMode ?? WorkflowMode.All,
  });

  const updateModalState = useCallback(
    (newState: Partial<WorkflowModalState>) => {
      setModalState({
        ...modalState,
        ...newState,
      });
    },
    [modalState],
  );

  // Sorting rules (process data sources)
  const [orderBy, setOrderBy] = useState(OrderBy.UpdateTime);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useMount(() => {
    setModalState({
      status: initState?.status ?? WorkFlowListStatus.HadPublished,
      dataSourceType: initState?.dataSourceType ?? DataSourceType.Workflow,
      creator: initState?.creator ?? MineActiveEnum.All,
      workflowTag: initState?.workflowTag ?? 0,
      productCategory: initState?.productCategory ?? '',
      query: initState?.query ?? '',
      isSpaceWorkflow: initState?.isSpaceWorkflow ?? true,
      workflowCategory:
        from === WorkflowModalFrom.ProjectWorkflowAddNode
          ? WorkflowCategory.Project
          : WorkflowCategory.Library,
      listFlowMode: initState?.listFlowMode ?? WorkflowMode.All,
    });

    reporter.info({
      message: 'useWorkflowModalParts mounted',
      meta: { from: props.from },
    });
  });

  const contextValue: WorkflowModalContextValue = {
    spaceId: spaceId ?? '',
    spaceType: spaceType ?? SpaceType.Team,
    bindBizId,
    bindBizType,
    projectId,
    flowMode,
    modalState,
    updateModalState,
    orderBy,
    setOrderBy,
    createModalVisible,
    setCreateModalVisible,
    getModalState: ctx => ({
      ...ctx.modalState,
    }),
    i18nMap,
  };

  if (!spaceType || !spaceId) {
    reporter.errorEvent({
      eventName: 'workflow_modal_in_bot_no_spaceId',
      error: new CustomError('normal_error', 'no spaceId'),
    });
    return {
      sider: null,
      content: null,
      filter: null,
    } as const;
  }

  const isBindDouyin = bindBizType === BindBizType.DouYinBot;
  const hideSidebar = hideSider || isBindDouyin;

  /** Sidebar Component */
  const sider = hideSidebar ? null : (
    <QueryClientProvider client={workflowQueryClient}>
      <WorkflowModalContext.Provider value={contextValue}>
        <WorkflowModalSider ref={sideRef} {...props} />
      </WorkflowModalContext.Provider>
    </QueryClientProvider>
  );

  /** process list component */
  const content = (
    <QueryClientProvider client={workflowQueryClient}>
      <WorkflowModalContext.Provider value={contextValue}>
        <WorkflowModalContent
          {...props}
          onDupSuccess={val => {
            if (!props.onDupSuccess) {
              return;
            }

            if (modalState.dataSourceType === DataSourceType.Product) {
              const resourceMap: Record<string, FlowResourceFrom> = {
                [WorkflowModalFrom.SpaceWorkflowList]:
                  FlowResourceFrom.template,
                [WorkflowModalFrom.WorkflowAddNode]: FlowResourceFrom.flowIde,
                [WorkflowModalFrom.BotSkills]: FlowResourceFrom.botIde,
                [WorkflowModalFrom.BotMultiSkills]: FlowResourceFrom.botIde,
                [WorkflowModalFrom.BotTrigger]: FlowResourceFrom.botIde,
                [WorkflowModalFrom.BotShortcut]: FlowResourceFrom.botIde,
                [WorkflowModalFrom.WorkflowAgent]: FlowResourceFrom.botIde,
              };

              const resource =
                resourceMap[props.from || ''] ?? FlowResourceFrom.botIde;
              sendTeaEvent(EVENT_NAMES.flow_duplicate_click, {
                store_type: isGeneralWorkflow(flowMode)
                  ? FlowStoreType.workflow
                  : FlowStoreType.imageflow,
                resource,
                category_name: sideRef.current?.getCurrent()?.name || '',
                duplicate_type:
                  props.from === WorkflowModalFrom.BotSkills
                    ? FlowDuplicateType.toBot
                    : FlowDuplicateType.toWorkspace,
              });
            }
            props.onDupSuccess(val);
          }}
        />
      </WorkflowModalContext.Provider>
    </QueryClientProvider>
  );

  /** filter component */
  let filter = (
    <QueryClientProvider client={workflowQueryClient}>
      <WorkflowModalContext.Provider value={contextValue}>
        {isBindDouyin ? (
          <WorkflowModalFilterForDouyin {...props} />
        ) : (
          <WorkflowModalFilter {...props} />
        )}
      </WorkflowModalContext.Provider>
    </QueryClientProvider>
  );

  // After hiding the sider, put the title on the filter
  if (hideSidebar && !isBindDouyin) {
    const title = I18n.t(
      WORKFLOW_MODAL_I18N_KEY_MAP[flowMode]?.[
        ModalI18nKey.Title
      ] as I18nKeysNoOptionsType,
    );
    filter = (
      <div className="flex flex-col items-start flex-grow flex-shrink-0">
        <div className={styles.title}>{title}</div>
        {filter}
      </div>
    );
  }
  return {
    sider,
    filter,
    content,
  } as const;
};
