import { ContainerModule, injectable } from 'inversify';
import {
  createFreeHistoryPlugin,
  FormModelV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  FlowNodeFormData,
  createNodeContainerModules,
  createNodeEntityDatas,
} from '@flowgram-adapter/free-layout-editor';
import {
  FlowDocumentContainerModule,
  FlowDocumentContribution,
} from '@flowgram-adapter/free-layout-editor';
import {
  PlaygroundMockTools,
  PlaygroundContext,
  bindContributions,
  Playground,
  loadPlugins,
  EntityManagerContribution,
  type EntityManager,
} from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowDocument,
  WorkflowDocumentContainerModule,
} from '@flowgram-adapter/free-layout-editor';
import { createWorkflowVariablePlugins } from '@coze-workflow/variable';
import { WorkflowNodesService } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base/types';
import { ValidationService } from '@coze-workflow/base/services';

import { WorkflowEncapsulateContainerModule } from '../src/workflow-encapsulate-container-module';
import { EncapsulateValidatorsContainerModule } from '../src/validators';
import {
  EncapsulateWorkflowJSONValidator,
  type EncapsulateValidateResult,
} from '../src/validate';
import { EncapsulateApiService } from '../src/api';
import { MockValidationService } from './validation-service.mock';
import { MockEncapsulateApiService } from './api-service.mock';

@injectable()
export class MockPlaygroundContext implements PlaygroundContext {
  getNodeTemplateInfoByType() {
    return {};
  }
}

@injectable()
export class MockWorkflowEncapsulateValidator
  implements EncapsulateWorkflowJSONValidator
{
  validate(_json, _result: EncapsulateValidateResult): void | Promise<void> {
    return;
  }
}

@injectable()
export class MockWorkflowForm
  implements FlowDocumentContribution, EntityManagerContribution
{
  registerDocument(document: WorkflowDocument): void {
    document.registerNodeDatas(...createNodeEntityDatas());
    document.registerFlowNodes({
      type: StandardNodeType.SubWorkflow,
      formMeta: {
        render: () => null,
      },
    });
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

// eslint-disable-next-line max-params
const TestModule = new ContainerModule((bind, _unbind, _isBound, rebind) => {
  rebind(PlaygroundContext).to(MockPlaygroundContext);

  rebind(EncapsulateApiService)
    .to(MockEncapsulateApiService)
    .inSingletonScope();
  bind(ValidationService).to(MockValidationService).inSingletonScope();
  bindContributions(bind, MockWorkflowEncapsulateValidator, [
    EncapsulateWorkflowJSONValidator,
  ]);

  bind(WorkflowNodesService).toSelf().inSingletonScope();
  bindContributions(bind, MockWorkflowForm, [
    FlowDocumentContribution,
    EntityManagerContribution,
  ]);
});

export function createContainer() {
  const container = PlaygroundMockTools.createContainer([
    FlowDocumentContainerModule,
    WorkflowDocumentContainerModule,
    WorkflowEncapsulateContainerModule,
    EncapsulateValidatorsContainerModule,
    ...createNodeContainerModules(),
    TestModule,
  ]);
  const playground = container.get(Playground);

  loadPlugins(
    [
      createFreeHistoryPlugin({ enable: true, limit: 50 }),
      ...createWorkflowVariablePlugins({}),
    ],
    container,
  );
  playground.init();
  return container;
}
