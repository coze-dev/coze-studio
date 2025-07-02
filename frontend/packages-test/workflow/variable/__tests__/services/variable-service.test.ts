import { WorkflowVariableService } from 'src';
import { loopJSON } from '__tests__/workflow.mock';
import { allKeyPaths } from '__tests__/variable.mock';
import { createContainer } from '__tests__/create-container';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

describe('test variable service', () => {
  let workflowDocument: WorkflowDocument;
  let variableService: WorkflowVariableService;

  beforeEach(async () => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    variableService = container.get<WorkflowVariableService>(
      WorkflowVariableService,
    );

    await workflowDocument.fromJSON(loopJSON);
  });

  test('test get variable', () => {
    expect(
      allKeyPaths.map(_case => {
        const workflowVariable = variableService.getWorkflowVariableByKeyPath(
          _case,
          {},
        );

        if (!workflowVariable) {
          return [variableService.getViewVariableByKeyPath(_case, {})];
        }

        return [
          variableService.getViewVariableByKeyPath(_case, {}),
          workflowVariable.viewType,
          workflowVariable.renderType,
          workflowVariable.dtoMeta,
          workflowVariable.refExpressionDTO,
          workflowVariable.key,
          workflowVariable.parentVariables.map(_field => _field.key),
          workflowVariable.children.map(_field => _field.key),
          workflowVariable.expressionPath,
          workflowVariable.groupInfo,
          workflowVariable.node.id,
        ];
      }),
    ).toMatchSnapshot();
  });
});
