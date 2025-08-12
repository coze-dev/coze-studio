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

import { ContainerModule } from 'inversify';
import {
  FormContribution,
  NodeContribution,
} from '@flowgram-adapter/free-layout-editor';
import { FlowDocumentContribution } from '@flowgram-adapter/free-layout-editor';
import { PlaygroundContext } from '@flowgram-adapter/free-layout-editor';
import {
  bindConfigEntity,
  WorkflowDocumentOptions,
  WorkflowDragService,
} from '@flowgram-adapter/free-layout-editor';
import { bindContributions } from '@flowgram-adapter/common';
import {
  TestRunService,
  TestRunReporterService,
} from '@coze-workflow/test-run/plugins';
import {
  FlowRendererContribution,
  WorkflowShortcutsContribution,
} from '@coze-workflow/render';
import { ValidationService } from '@coze-workflow/base/services';

import {
  bindShortcuts,
  WorkflowCopyShortcutsContribution,
  // WorkflowDeleteShortcutsContribution,
  WorkflowExportShortcutsContribution,
  WorkflowLayoutShortcutsContribution,
  WorkflowLoadShortcutsContribution,
  WorkflowPasteShortcutsContribution,
  WorkflowSelectAllShortcutsContribution,
  WorkflowZoomShortcutsContribution,
} from '@/shortcuts';
import { WorkflowNodesV2Contribution } from '@/container/workflow-nodes-v2-contribution';

import { WorkflowPlaygroundContext } from '../workflow-playground-context';
import { WorkflowOperationServiceProvider } from '../services/workflow-operation-service';
import {
  WorkflowLinesService,
  WorkflowLinesServiceProvider,
} from '../services/workflow-line-service';
import {
  WorkflowCustomDragService,
  WorkflowEditService,
  WorkflowOperationService,
  WorkflowRunService,
  WorkflowSaveService,
  WorkflowValidationService,
  WorkflowModelsService,
  WorkflowFloatLayoutService,
  ChatflowService,
  NodeVersionService,
  RoleService,
  RelatedCaseDataService,
  TestRunReporterService as WorkflowTestRunReporterService,
  ValueExpressionService,
  ValueExpressionServiceImpl,
  DatabaseNodeService,
  DatabaseNodeServiceImpl,
  TriggerService,
  PluginNodeService,
  SubWorkflowNodeService,
  WorkflowDependencyService,
} from '../services';
import { WorkflowDocumentCustomOptions } from '../options/workflow-document-custom-options';
import { FormAbilityExtensionsFormContribution } from '../form-extensions';
import {
  WorkflowDependencyStateEntity,
  WorkflowExecStateEntity,
  WorkflowGlobalStateEntity,
  WorkflowTestFormStateEntity,
} from '../entities';
import { WorkflowPageContribution } from './workflow-page-contribution';
import { WorkflowNodeContribution } from './workflow-node-contribution';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowPageContainerModule = new ContainerModule(
  // eslint-disable-next-line max-params
  (bind, _unbind, _isbound, rebind) => {
    /**
     * validation
     */
    bind(ValidationService).to(WorkflowValidationService).inSingletonScope();
    // Combine old identifiers
    bind(WorkflowValidationService).toService(ValidationService);

    bind(WorkflowEditService).toSelf().inSingletonScope();
    bind(TestRunReporterService)
      .to(WorkflowTestRunReporterService)
      .inSingletonScope();
    bind(WorkflowTestRunReporterService).toService(TestRunReporterService);
    bind(WorkflowRunService).toSelf().inSingletonScope();
    bind(TestRunService).toService(WorkflowRunService);
    bind(WorkflowSaveService).toSelf().inSingletonScope();
    bind(WorkflowOperationService).toSelf().inSingletonScope();
    bind(WorkflowFloatLayoutService).toSelf().inSingletonScope();
    bind(NodeVersionService).toSelf().inSingletonScope();
    bind(RoleService).toSelf().inSingletonScope();
    bind(PluginNodeService).toSelf().inSingletonScope();
    bind(SubWorkflowNodeService).toSelf().inSingletonScope();
    bind(RelatedCaseDataService).toSelf().inSingletonScope();
    bind(WorkflowDependencyService).toSelf().inSingletonScope();

    bind(ChatflowService).toSelf().inSingletonScope();

    bind(WorkflowOperationServiceProvider)
      .toDynamicValue(ctx => () => ctx.container.get(WorkflowOperationService))
      .inSingletonScope();

    bind(WorkflowPlaygroundContext).toSelf().inSingletonScope();
    bind(WorkflowModelsService).toSelf().inSingletonScope();

    bind(WorkflowDocumentCustomOptions).toSelf().inSingletonScope();
    rebind(WorkflowDocumentOptions).toService(WorkflowDocumentCustomOptions);
    bind(WorkflowLinesService).toSelf().inSingletonScope();
    bind(WorkflowCustomDragService).toSelf().inSingletonScope();
    rebind(WorkflowDragService).toService(WorkflowCustomDragService);

    bind(WorkflowLinesServiceProvider)
      .toDynamicValue(ctx => () => ctx.container.get(WorkflowLinesService))
      .inSingletonScope();

    rebind(PlaygroundContext).toService(WorkflowPlaygroundContext);
    bindConfigEntity(bind, WorkflowExecStateEntity);
    bindConfigEntity(bind, WorkflowGlobalStateEntity);
    bindConfigEntity(bind, WorkflowTestFormStateEntity);
    bindConfigEntity(bind, WorkflowDependencyStateEntity);
    bindContributions(bind, WorkflowPageContribution, [
      FlowDocumentContribution,
      FlowRendererContribution,
    ]);
    bindShortcuts(bind, WorkflowShortcutsContribution, [
      WorkflowCopyShortcutsContribution,
      WorkflowPasteShortcutsContribution,
      // WorkflowDeleteShortcutsContribution,
      WorkflowLayoutShortcutsContribution,
      WorkflowZoomShortcutsContribution,
      WorkflowExportShortcutsContribution,
      WorkflowLoadShortcutsContribution,
      WorkflowSelectAllShortcutsContribution,
    ]);
    bindContributions(bind, FormAbilityExtensionsFormContribution, [
      FormContribution,
    ]);
    bindContributions(bind, WorkflowNodeContribution, [NodeContribution]);
    // WorkflowPageContainerModule can be rewritten as function generation, receive relevant props, and can currently consider receiving only WorkflowNodesV2Contribution parameters
    bindContributions(bind, WorkflowNodesV2Contribution, [
      FlowDocumentContribution,
    ]);

    bind(ValueExpressionService)
      .to(ValueExpressionServiceImpl)
      .inSingletonScope();

    bind(DatabaseNodeService).to(DatabaseNodeServiceImpl).inSingletonScope();

    bind(TriggerService).toSelf().inSingletonScope();
  },
);
