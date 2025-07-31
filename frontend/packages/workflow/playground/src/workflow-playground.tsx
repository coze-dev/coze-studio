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

import 'reflect-metadata';

import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { forwardRef, useEffect, type PropsWithChildren } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { QueryClientProvider } from '@tanstack/react-query';
import { GlobalError } from '@coze-foundation/layout';
import { WorkflowRenderProvider } from '@coze-workflow/render';
import { WorkflowNodesContainerModule } from '@coze-workflow/nodes';
import { WorkflowHistoryContainerModule } from '@coze-workflow/history';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import { workflowQueryClient } from '@coze-workflow/base/api';
import { ErrorBoundary, logger } from '@coze-arch/logger';
import { useSpaceStore } from '@coze-arch/bot-studio-store';

import {
  type WorkflowPlaygroundProps,
  type WorkflowPlaygroundRef,
} from './typing';
import { useWorkflowPreset } from './hooks';
import { WorkflowPageContainerModule } from './container/workflow-page-container-module';
import WorkflowContainer from './components/workflow-container';

const loggerWithScope = logger.createLoggerWith({
  ctx: {
    namespace: 'workflow-error',
  },
});

const PlayGroundErrorBoundary = (props: PropsWithChildren) => {
  // Use your own ErrorBoundary to display errors under the operation and maintenance platform, which can display more detailed errors.
  // At the same time, avoid white screen errors under the operation and maintenance platform.
  if (IS_BOT_OP) {
    return <>{props.children}</>;
  }

  return (
    <ErrorBoundary
      FallbackComponent={() => (IS_BOT_OP ? null : <GlobalError />)}
      errorBoundaryName="workflow-error-boundary"
      logger={loggerWithScope}
    >
      {props.children}
    </ErrorBoundary>
  );
};

export const WorkflowPlayground = forwardRef<
  WorkflowPlaygroundRef,
  WorkflowPlaygroundProps
>(({ spaceId = PUBLIC_SPACE_ID, parentContainer, ...props }, ref) => {
  console.log('debugger workflow playground');
  const { spaceList, setSpace, fetchSpaces, checkSpaceID, inited } =
    useSpaceStore(
      useShallow(store => ({
        spaceList: store.spaceList,
        setSpace: store.setSpace,
        fetchSpaces: store.fetchSpaces,
        checkSpaceID: store.checkSpaceID,
        inited: store.inited,
      })),
    );
  useEffect(() => {
    let isActive = true;
    const initSpace = async () => {
      if (!inited) {
        await fetchSpaces(true);
      }
      if (!isActive) {
        return;
      }

      checkSpaceID(spaceId);
      if (spaceId !== PUBLIC_SPACE_ID) {
        setSpace(spaceId);
      }
    };

    initSpace();

    return () => {
      isActive = false;
    };
  }, [spaceId, fetchSpaces, setSpace, checkSpaceID]);

  const preset = useWorkflowPreset(props);

  if (!inited) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <QueryClientProvider client={workflowQueryClient}>
        <WorkflowRenderProvider
          parentContainer={parentContainer}
          containerModules={[
            WorkflowNodesContainerModule,
            WorkflowPageContainerModule,
            WorkflowHistoryContainerModule,
          ]}
          preset={preset}
        >
          <PlayGroundErrorBoundary>
            <WorkflowContainer
              ref={ref}
              {...props}
              spaceId={spaceId}
              spaceList={spaceList}
            />
          </PlayGroundErrorBoundary>
        </WorkflowRenderProvider>
      </QueryClientProvider>
    </DndProvider>
  );
});
