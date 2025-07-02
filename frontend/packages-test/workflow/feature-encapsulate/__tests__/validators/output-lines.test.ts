import { describe, it, expect, beforeEach } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateValidateErrorCode,
  EncapsulateValidateService,
} from '../../src/validate';

describe('output-lines', () => {
  let encapsulateValidateService: EncapsulateValidateService;
  let workflowDocument: WorkflowDocument;
  beforeEach(async () => {
    const container = createContainer();
    encapsulateValidateService = container.get<EncapsulateValidateService>(
      EncapsulateValidateService,
    );
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    await workflowDocument.fromJSON(complexMock);
  });

  it('should validate two output ports return error', async () => {
    await workflowDocument.createWorkflowNode({
      id: 'output1',
      type: 'test',
    });
    await workflowDocument.createWorkflowNode({
      id: 'output2',
      type: 'test',
    });
    workflowDocument.linesManager.createLine({
      from: '154702',
      to: 'output1',
    });
    workflowDocument.linesManager.createLine({
      from: 'output1',
      to: 'output2',
    });
    const nodes = ['154702', '102906'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateValidateService.validate(nodes);
    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.ENCAPSULATE_LINES),
    ).toBeTruthy();
  });
});
