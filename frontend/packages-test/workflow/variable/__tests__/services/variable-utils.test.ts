import { variableUtils, WorkflowVariableService } from 'src';
import { loopJSON } from '__tests__/workflow.mock';
import { allConstantInputs, allEndRefInputs } from '__tests__/variable.mock';
import { createContainer } from '__tests__/create-container';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { ValueExpression } from '@coze-workflow/base';

import { mockFullOutputs } from './../variable.mock';

describe('test variable utils', () => {
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

  test('Ref VO DTO convert', () => {
    const endNode = workflowDocument.getNode('end')!;

    const allEndInputs = [...allEndRefInputs, ...allConstantInputs];

    const dto = allEndInputs.map(_input =>
      variableUtils.inputValueToDTO(_input, variableService, {
        node: endNode,
      }),
    );
    expect(dto).toMatchSnapshot();

    const voBack = dto
      .filter(Boolean)
      .map(_dto => variableUtils.inputValueToVO(_dto!, variableService));

    const availableEndInputs = allEndInputs.filter(
      _ref => !ValueExpression.isEmpty(_ref.input),
    );

    expect(availableEndInputs.length).toBeLessThan(allEndInputs.length);
    expect(voBack.length).toBe(availableEndInputs.length);
    voBack.forEach((_vo, idx) => {
      expect(_vo.name).toBe(availableEndInputs[idx].name);
    });
  });

  test('Variable VO DTO convert', () => {
    const dto = mockFullOutputs.map(_output =>
      variableUtils.viewMetaToDTOMeta(_output),
    );

    expect(dto).toMatchSnapshot();

    const voBack = dto.map(_dto => variableUtils.dtoMetaToViewMeta(_dto));

    voBack.forEach((_vo, idx) => {
      expect(_vo.type).toBe(mockFullOutputs[idx].type);
      expect(_vo.name).toBe(mockFullOutputs[idx].name);
    });
  });
});
