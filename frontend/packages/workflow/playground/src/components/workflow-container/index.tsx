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
 
import { Helmet } from 'react-helmet';
import { useDrop } from 'react-dnd';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type DragEventHandler,
} from 'react';

import classnames from 'classnames';
import { QueryClientProvider } from '@tanstack/react-query';
import {
  PlaygroundReactRenderer,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { EncapsulatePanel } from '@coze-workflow/feature-encapsulate';
import { workflowQueryClient } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Spin } from '@coze-arch/bot-semi';
import { getFlags } from '@coze-arch/bot-flags';
import { CustomError } from '@coze-arch/bot-error';
import { type BotSpace } from '@coze-arch/bot-api/developer_api';

import { AddNodeModalProvider } from '@/contexts/add-node-modal-context';

import { WorkflowRefreshModal } from '../workflow-refresh-modal';
import { WorkflowOuterSideSheetHolder } from '../workflow-outer-side-sheet';
import { WorkflowInnerSideSheetHolder } from '../workflow-inner-side-sheet';
import { useCommitAction } from '../workflow-header/components/history-button/components/history-drawer/use-commit-action';
import WorkflowHeader from '../workflow-header';
import { Toolbar } from '../toolbar';
import { useResultSideSheetVisible } from '../test-run/execute-result/execute-result-side-sheet/hooks/use-result-side-sheet-visible';
import { TemplatePanel, TemplatePreview } from '../template-panel';
import RetrieveBanner from '../retrieve-banner';
import { ProblemPanel } from '../problem-panel';
import { ModifyBanner } from '../modify-banner';
import { DragTooltip } from '../drag-tooltip';
import { DatabaseDetailModal } from '../database-detail-modal';
import { ChatTestRunPauseSideSheet } from '../chat-testrun-pause-side-sheet';
import {
  type AddNodeRef,
  type WorkflowPlaygroundProps,
  type WorkflowPlaygroundRef,
  type DragObject,
} from '../../typing';
import { WorkflowCustomDragService, WorkflowSaveService } from '../../services';
import { useTestRun } from '../../hooks/use-test-run';
import {
  useFloatLayoutService,
  useGlobalState,
  useScrollToNode,
  useWorkflowRunService,
  useDependencyService,
} from '../../hooks';
import {
  DND_ACCEPT_KEY,
  WORKFLOW_PLAYGROUND_CONTENT_ID,
} from '../../constants';
import { WorkflowFloatLayout } from './workflow-float-layout';
import { useNodesMount } from './use-nodes-mount';
import { useDataCompensation } from './use-data-compensation';

import styles from './index.module.less';

/**
 * 流程画布
 */
const WorkflowContainer = forwardRef<
  WorkflowPlaygroundRef,
  WorkflowPlaygroundProps & {
    spaceList: BotSpace[];
  }
>((props, ref) => {
  const workflowState = useGlobalState();
  const workflowSaveService =
    useService<WorkflowSaveService>(WorkflowSaveService);
  const dependencyService = useDependencyService();
  const floatLayoutService = useFloatLayoutService();
  const runService = useWorkflowRunService();
  const { handleTestRun, cancelTestRun } = useTestRun({ callbacks: props });
  const { resetToCommitById } = useCommitAction();
  const { closeSideSheetAndHideResult, showResult } =
    useResultSideSheetVisible();
  const { loading, loadingError, readonly, isBindDouyin } = workflowState;
  let playgroundContent;
  const addNodeRef = useRef<AddNodeRef>(null);
  const hasFitView = useRef<boolean>(false);
  const isNodesMount = useNodesMount();
  // 同步组件属性到 globalStatus
  useMemo(() => {
    const { spaceList, ...playgroundProps } = props;

    workflowState.updateConfig({
      playgroundProps,
      spaceList,
    });
  }, [props]);

  // 初始化成功
  useEffect(() => {
    if (!loading && !loadingError && isNodesMount) {
      props.onInit?.(workflowState);
    }
  }, [loading, isNodesMount, loadingError, workflowState]);

  // 监听 TTI 事件，执行数据补偿操作，并保存草稿
  useDataCompensation(workflowState);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(event => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const dragService = useService<WorkflowCustomDragService>(
    WorkflowCustomDragService,
  );

  const [, drop] = useDrop(() => ({
    accept: DND_ACCEPT_KEY,
    canDrop: (item: DragObject, monitor) =>
      dragService.canDrop({
        coord: monitor.getSourceClientOffset() ?? { x: 0, y: 0 },
        dragNode: {
          type: item.nodeType,
          json: item.nodeJson,
        },
      }),
    drop: (item: DragObject, monitor) => {
      const coord = monitor.getClientOffset() ?? { x: 0, y: 0 };
      addNodeRef.current?.handleAddNode?.(item, coord, true);
    },
  }));

  const scrollToNode = useScrollToNode();

  useImperativeHandle(ref, () => ({
    triggerTestRun: async () => {
      await handleTestRun();
      return true;
    },
    getProcess: async (obj: { executeId?: string }) => {
      await runService.getRTProcessResult(obj);
    },
    reload: async () => {
      floatLayoutService.closeAll();
      await workflowSaveService.reloadDocument();
      props.onInit?.(workflowState);
    },
    cancelTestRun: () => cancelTestRun(),
    showTestRunResult: (executeIdOrResp, subExecuteId) => {
      if (!executeIdOrResp) {
        // 显示最新一次试运行结果
        showResult();
      } else if (typeof executeIdOrResp === 'string') {
        // 显示指定运行 ID 的结果
        showResult({ executeId: executeIdOrResp, subExecuteId });
      } else {
        // 直接显示结果
        showResult({ processResp: executeIdOrResp });
      }
    },
    hideTestRunResult: () => {
      closeSideSheetAndHideResult();
    },
    resetToHistory: ({ commitId, optType }) => {
      resetToCommitById(commitId, optType);
    },
    scrollToNode: (nodeId: string) => {
      if (nodeId) {
        scrollToNode(nodeId);
      }
    },
    triggerFitView: async () => {
      if (!hasFitView.current) {
        await workflowSaveService.fitView();
        hasFitView.current = true;
      }
    },
    loadGlobalVariables: async () => {
      await workflowSaveService.loadGlobalVariables();
    },
    onResourceChange: (resourceProps, callback) =>
      dependencyService.updateDependencySources(resourceProps, callback),
  }));

  if (loading) {
    playgroundContent = (
      <Spin spinning={true} style={{ height: '100%', width: '100%' }} />
    );
  } else if (loadingError) {
    // 触发异常 走顶层 error boundary fallback
    throw new CustomError('normal_error', loadingError);
  } else {
    const Sidebar = props.sidebar;

    // When the workflow is binded to Douyin Account，the template preview is not displayed
    const showTemplatePreview = !isBindDouyin;
    playgroundContent = (
      <QueryClientProvider client={workflowQueryClient}>
        <div className="flex flex-1 h-full">
          <div className="flex flex-1 flex-col">
            {props.renderHeader ? (
              props.renderHeader({ handleTestRun })
            ) : (
              <WorkflowHeader />
            )}
            <RetrieveBanner />
            {/* project 内无需展示 */}
            {!workflowState.projectId && <ModifyBanner />}
            <div className={`${styles.workflowContent} clean-code`}>
              {!readonly && Sidebar ? <Sidebar ref={addNodeRef} /> : null}
              <AddNodeModalProvider ref={addNodeRef} readonly={readonly}>
                <div
                  id={WORKFLOW_PLAYGROUND_CONTENT_ID}
                  className={styles.workflowPlayground}
                >
                  <div
                    ref={drop}
                    className={styles.workflowPlaygroundRender}
                    // onDrop={onDrop}
                    onDragOver={onDragOver}
                  >
                    <PlaygroundReactRenderer />

                    <DragTooltip />

                    <WorkflowFloatLayout
                      components={{
                        problemPanel: () => <ProblemPanel />,
                        templatePanel: () =>
                          showTemplatePreview ? <TemplatePanel /> : null,
                      }}
                    >
                      <Toolbar
                        disableTraceAndTestRun={props?.disableTraceAndTestRun}
                      />
                      {showTemplatePreview ? <TemplatePreview /> : null}
                      {getFlags()['bot.automation.encapsulate'] ? (
                        <EncapsulatePanel />
                      ) : null}
                    </WorkflowFloatLayout>
                    <WorkflowRefreshModal />
                  </div>
                </div>
              </AddNodeModalProvider>
              {/* 用来渲染画布内部局部测拉窗的占位，会挤压画布 */}
              <WorkflowInnerSideSheetHolder />
            </div>
          </div>
          <WorkflowOuterSideSheetHolder />
        </div>
        <ChatTestRunPauseSideSheet />
      </QueryClientProvider>
    );
  }

  return (
    <>
      {!workflowState.projectId && (
        <Helmet>
          <title>
            {I18n.t('workflow_tab_title', {
              name: workflowState.info?.name,
            })}
          </title>
        </Helmet>
      )}

      <div
        className={classnames({
          [styles.workflowContainer]: true,
          [styles.workflowContainerOp]: IS_BOT_OP,
          [props.className || '']: props.className,
        })}
        style={props.style}
      >
        {playgroundContent}

        <DatabaseDetailModal />
      </div>
    </>
  );
});

export default WorkflowContainer;
