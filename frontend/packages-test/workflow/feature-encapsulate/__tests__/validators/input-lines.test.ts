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

describe('input-lines', () => {
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

  it('should validate without error', async () => {
    const nodes = ['102906', '154702'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateValidateService.validate(nodes);
    expect(res.hasError()).toBeFalsy();
  });

  it('should validate two input ports return error', async () => {
    const nodes = ['109408', '154702'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateValidateService.validate(nodes);
    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.ENCAPSULATE_LINES),
    ).toBeTruthy();
  });
});
