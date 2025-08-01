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

import React, { useMemo, useEffect } from 'react';

import { useMemoizedFn } from 'ahooks';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowSelectService } from '@flowgram-adapter/free-layout-editor';

import {
  WorkflowRunService,
  TestRunState,
} from '@/services/workflow-run-service';
import { type PanelInfo } from '@/services/workflow-float-layout-service';
import { useFloatLayoutService } from '@/hooks';
import { LayoutPanelKey } from '@/constants';

import {
  TraceListPanel,
  TraceDetailPanel,
  type TraceListPanelProps,
  type TraceDetailPanelProps,
} from '../test-run/trace';
import {
  StartTestFormSheet,
  type TestWorkflowFormPanelProps,
} from '../test-run/test-form-sheet-v2';
import {
  ChatFlowTestFormPanel,
  type ChatFlowTestFormPanelProps,
} from '../test-run/chat-flow-test-form-panel';
import { NodeFormPanel, type NodeFormPanelProps } from '../node-side-sheet';
import { RoleConfigPanel } from '../flow-role';
import { FloatLayout, type FloatLayoutProps } from '../float-layout';

const useCloseNodeFormWhenBlur = () => {
  const selectService = useService(WorkflowSelectService);
  const floatLayoutService = useFloatLayoutService();
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  useEffect(() => {
    const disposable = selectService.onSelectionChanged(() => {
      const running = [TestRunState.Executing, TestRunState.Paused].includes(
        runService.testRunState,
      );
      if (
        !selectService.activatedNode &&
        floatLayoutService.right.key === LayoutPanelKey.NodeForm &&
        !running
      ) {
        floatLayoutService.close();
      }
    });
    return () => disposable.dispose();
  }, [selectService, floatLayoutService, runService]);
};

/**
 * Try canceling practice run after closing the node and practice run panel
 */
const useCancelTestRunWhenClosePanel = () => {
  const floatLayoutService = useFloatLayoutService();
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const tryCancelTestRun = useMemoizedFn((info: PanelInfo) => {
    const { key } = info;
    const running = [TestRunState.Executing, TestRunState.Paused].includes(
      runService.testRunState,
    );
    if (
      running &&
      [
        LayoutPanelKey.NodeForm,
        LayoutPanelKey.TestFlowForm,
        LayoutPanelKey.TestChatFlowForm,
      ].includes(key as LayoutPanelKey)
    ) {
      runService.cancelTestRun();
    }
  });

  useEffect(() => {
    const disposable = floatLayoutService.onUnmount(tryCancelTestRun);

    return () => disposable.dispose();
  }, [floatLayoutService, tryCancelTestRun]);
};

export const WorkflowFloatLayout: React.FC<
  React.PropsWithChildren<FloatLayoutProps>
> = ({ components, children }) => {
  const registry = useMemo(
    () => ({
      ...components,
      [LayoutPanelKey.NodeForm]: (p: NodeFormPanelProps) => (
        <NodeFormPanel {...p} />
      ),
      [LayoutPanelKey.TestFlowForm]: (p: TestWorkflowFormPanelProps) => (
        <StartTestFormSheet {...p} />
      ),
      [LayoutPanelKey.TraceList]: (p: TraceListPanelProps) => (
        <TraceListPanel {...p} />
      ),
      [LayoutPanelKey.TestChatFlowForm]: (p: ChatFlowTestFormPanelProps) => (
        <ChatFlowTestFormPanel {...p} />
      ),
      [LayoutPanelKey.RoleConfig]: () => <RoleConfigPanel />,
      traceDetail: (p: TraceDetailPanelProps) => <TraceDetailPanel {...p} />,
    }),
    [components],
  );

  useCancelTestRunWhenClosePanel();

  useCloseNodeFormWhenBlur();

  return <FloatLayout components={registry}>{children}</FloatLayout>;
};
