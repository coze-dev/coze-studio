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

import { useCallback } from 'react';

import { createMinimapPlugin } from '@flowgram-adapter/free-layout-editor';
import { createHistoryNodePlugin } from '@flowgram-adapter/free-layout-editor';
import { createFreeSnapPlugin } from '@flowgram-adapter/free-layout-editor';
import { createFreeNodePanelPlugin } from '@flowgram-adapter/free-layout-editor';
import { createFreeLinesPlugin } from '@flowgram-adapter/free-layout-editor';
import { createContainerNodePlugin } from '@flowgram-adapter/free-layout-editor';
import {
  EntityManager,
  type PluginContext,
} from '@flowgram-adapter/free-layout-editor';
import { createWorkflowVariablePlugins } from '@coze-workflow/variable';
import { createTestRunPlugin } from '@coze-workflow/test-run';
import {
  createFreeHistoryPlugin,
  createOperationReportPlugin,
} from '@coze-workflow/history';
import { createWorkflowEncapsulatePlugin } from '@coze-workflow/feature-encapsulate';
import { type StandardNodeType } from '@coze-workflow/base';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type WorkflowPlaygroundProps } from '@/typing';
import { RelatedCaseDataService } from '@/services';
import { WorkflowGlobalStateEntity } from '@/entities';

import { NodePanel } from '../components/node-panel';
import { LineAddButton } from '../components/line-add-button';

const createEncapsulatePlugin = (props?: WorkflowPlaygroundProps) =>
  createWorkflowEncapsulatePlugin({
    getGlobalState: (ctx: PluginContext) =>
      ctx
        .get<EntityManager>(EntityManager)
        .getEntity<WorkflowGlobalStateEntity>(
          WorkflowGlobalStateEntity,
        ) as WorkflowGlobalStateEntity,
    getNodeTemplate: (ctx: PluginContext) => (type: StandardNodeType) =>
      ctx
        .get<WorkflowPlaygroundContext>(WorkflowPlaygroundContext)
        .getNodeTemplateInfoByType(type),
    onEncapsulate: async (res, ctx) => {
      if (!res.success) {
        return;
      }

      if (res.projectId) {
        // Refresh process list in project and rename to newly created process
        await props?.refetchProjectResourceList?.();
        await props?.renameProjectResource?.(res.workflowId);
      } else {
        // Update the Bot information bound by the generation process in the resource library
        const relatedCaseDataService = ctx.get<RelatedCaseDataService>(
          RelatedCaseDataService,
        );
        relatedCaseDataService.updateRelatedBot(
          relatedCaseDataService.getRelatedBotValue(),
          res.workflowId,
        );
      }
    },
  });

export const useWorkflowPreset = (props?: WorkflowPlaygroundProps) => {
  const preset = useCallback(
    () => [
      createFreeLinesPlugin({
        renderInsideLine: LineAddButton,
      }),
      ...createWorkflowVariablePlugins(),
      createFreeHistoryPlugin({
        enable: true,
        limit: 50,
      }),
      createOperationReportPlugin({}),
      createMinimapPlugin({
        disableLayer: true,
        canvasStyle: {
          canvasWidth: 182,
          canvasHeight: 102,
          canvasPadding: 50,
          canvasBackground: 'rgba(245, 245, 245, 1)',
          canvasBorderRadius: 10,
          viewportBackground: 'rgba(235, 235, 235, 1)',
          viewportBorderRadius: 4,
          viewportBorderColor: 'rgba(201, 201, 201, 1)',
          viewportBorderWidth: 1,
          viewportBorderDashLength: 2,
          nodeColor: 'rgba(255, 255, 255, 1)',
          nodeBorderRadius: 2,
          nodeBorderWidth: 0.145,
          nodeBorderColor: 'rgba(6, 7, 9, 0.10)',
          overlayColor: 'rgba(255, 255, 255, 0)',
        },
        inactiveDebounceTime: 1,
      }),
      createFreeSnapPlugin({
        edgeColor: '#00B2B2',
        alignColor: '#00B2B2',
        edgeLineWidth: 1,
        alignLineWidth: 1,
        alignCrossWidth: 8,
      }),
      createFreeNodePanelPlugin({
        renderer: NodePanel,
      }),
      createHistoryNodePlugin({}),
      createContainerNodePlugin({}),
      createTestRunPlugin({}),
      createEncapsulatePlugin(props),
    ],
    [],
  );
  return preset;
};
