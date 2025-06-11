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
        }) as any,
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
