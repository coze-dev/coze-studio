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

import { createVariablePlugin } from '@flowgram-adapter/free-layout-editor';
import { createNodeVariablePlugin } from '@flowgram-adapter/free-layout-editor';
import {
  DecoratorAbility,
  FormManager,
} from '@flowgram-adapter/free-layout-editor';
import { FlowDocument } from '@flowgram-adapter/free-layout-editor';
import {
  Playground,
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/free-layout-editor';

import {
  getChildrenNode,
  getHasChildCanvasNodePublicDeps,
  getParentNode,
  getParentPublic,
  hasChildCanvas,
} from './utils/sub-canvas';
import { GlobalVariableService } from './services/global-variable-service';
import {
  WorkflowBatchService,
  WorkflowVariableService,
  WorkflowVariableValidationService,
} from './legacy';
import {
  variableConsumers,
  variableDecorators,
  variableProviders,
} from './form-extensions';
import {
  WorkflowNodeInputVariablesData,
  WorkflowNodeOutputVariablesData,
  WorkflowNodeRefVariablesData,
} from './datas';
import { extendASTNodes, WorkflowVariableFacadeService } from './core';
import { GLOBAL_VARIABLE_SCOPE_ID } from './constants';
import { VariableDebugLayer } from './components/variable-debug-panel/variable-debug-layer';

export const createWorkflowVariablePlugin: PluginCreator<object> =
  definePluginCreator<object>({
    onBind({ bind }) {
      bind(WorkflowVariableFacadeService).toSelf().inSingletonScope();
      bind(WorkflowVariableService).toSelf().inSingletonScope();
      bind(WorkflowBatchService).toSelf().inSingletonScope();
      bind(WorkflowVariableValidationService).toSelf().inSingletonScope();
      bind(GlobalVariableService).toSelf().inSingletonScope();
    },
    onInit(ctx) {
      const playground: Playground = ctx.get(Playground);
      const formManager: FormManager = ctx.get(FormManager);
      const document: FlowDocument = ctx.get(FlowDocument);

      // Trigger @postConstruct for GlobalVariableService
      ctx.get(GlobalVariableService);

      document.registerNodeDatas(
        WorkflowNodeOutputVariablesData,
        WorkflowNodeInputVariablesData,
        WorkflowNodeRefVariablesData,
      );

      if (IS_DEV_MODE) {
        playground.registerLayer(VariableDebugLayer);
      }

      variableProviders.forEach(_provider =>
        formManager.registerAbilityExtension('variable-provider', _provider),
      );

      variableConsumers.forEach(_consumer =>
        formManager.registerAbilityExtension('variable-consumer', _consumer),
      );

      variableDecorators.forEach(_decorator =>
        formManager.registerAbilityExtension(DecoratorAbility.type, _decorator),
      );
    },
  });

export const createWorkflowVariablePlugins = () => [
  createVariablePlugin({
    enable: true,
    layout: 'free',
    extendASTNodes,
    layoutConfig: {
      transformCovers(scopes, { scope, variableEngine }) {
        // Global variable scope covers all other scopes
        if (scope.id === GLOBAL_VARIABLE_SCOPE_ID) {
          return variableEngine
            .getAllScopes()
            .filter(_scope => _scope.id !== GLOBAL_VARIABLE_SCOPE_ID);
        }

        const node = scope.meta?.node;
        if (!node) {
          return scopes;
        }

        // Private can only access the sub-node of the current node and its own public.
        // if (scope.meta?.type === 'private' && scope.meta?.node) {
        //   const visibleNodes = [
        //     scope.meta?.node,
        //     ...getChildrenNode(scope.meta?.node),
        //   ];
        //   return scopes.filter(_scope =>
        //     visibleNodes.includes(_scope.meta?.node),
        //   );
        // }

        // Specialization: The public of the parent node can access the public of the sub-node (for aggregating output).
        const parentPublic = getParentPublic(node);
        if (parentPublic) {
          return [...scopes, parentPublic];
        }

        return scopes;
      },
      transformDeps(scopes, { scope, variableEngine }) {
        const node = scope.meta?.node;

        const globalScope = variableEngine.getScopeById(
          GLOBAL_VARIABLE_SCOPE_ID,
        );

        if (globalScope) {
          scopes.unshift(globalScope);
        }

        if (!node) {
          return scopes;
        }

        // Specialization: The public of the parent node can access the public of the sub-node (for aggregate output), and cannot select global variables
        if (scope.meta?.type === 'public' && hasChildCanvas(node)) {
          return getHasChildCanvasNodePublicDeps(node);
        }

        return scopes;
      },
      getFreeParent(node) {
        return getParentNode(node);
      },
      getFreeChildren(node) {
        return getChildrenNode(node);
      },
    },
  }),
  createNodeVariablePlugin({}),
  createWorkflowVariablePlugin({}),
];
