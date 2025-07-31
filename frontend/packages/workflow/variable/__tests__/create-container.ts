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

import { ContainerModule, injectable } from 'inversify';
import {
  type PlaygroundContext,
  type FlowNodeEntity,
  type EntityManager,
  FlowDocumentContribution,
  EntityManagerContribution,
  createFreeHistoryPlugin,
  FormModelV2,
  FlowNodeFormData,
  createNodeContainerModules,
  createNodeEntityDatas,
  FlowDocumentContainerModule,
  PlaygroundMockTools,
  Playground,
  loadPlugins,
  bindContributions,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowDocument,
  WorkflowDocumentContainerModule,
} from '@flowgram-adapter/free-layout-editor';

import { createWorkflowVariablePlugins } from '../src';
import { MockNodeRegistry } from './node.mock';

@injectable()
export class MockPlaygroundContext implements PlaygroundContext {
  getNodeTemplateInfoByType() {
    return {};
  }
}

@injectable()
export class MockWorkflowForm
  implements FlowDocumentContribution, EntityManagerContribution
{
  registerDocument(document: WorkflowDocument): void {
    document.registerNodeDatas(...createNodeEntityDatas());
  }

  registerEntityManager(entityManager: EntityManager): void {
    const formModelFactory = (entity: FlowNodeEntity) =>
      new FormModelV2(entity);
    entityManager.registerEntityData(
      FlowNodeFormData,
      () =>
        ({
          formModelFactory,
        } as any),
    );
  }
}

const testModule = new ContainerModule(bind => {
  bindContributions(bind, MockWorkflowForm, [
    FlowDocumentContribution,
    EntityManagerContribution,
  ]);
  bindContributions(bind, MockNodeRegistry, [FlowDocumentContribution]);
});

export function createContainer() {
  const container = PlaygroundMockTools.createContainer([
    FlowDocumentContainerModule,
    WorkflowDocumentContainerModule,
    ...createNodeContainerModules(),
    testModule,
  ]);
  const playground = container.get(Playground);

  loadPlugins(
    [
      createFreeHistoryPlugin({ enable: true, limit: 50 }),
      ...createWorkflowVariablePlugins(),
    ],
    container,
  );
  playground.init();
  return container;
}
