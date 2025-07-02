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

describe('ports', () => {
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

  it('should validate no input ports return error', async () => {
    const nodes = ['100001', '177547'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateValidateService.validate(nodes);
    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.INVALID_PORTS),
    ).toBeTruthy();
  });

  it('should validate no output ports return error', async () => {
    const nodes = ['109408', '156471'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const res = await encapsulateValidateService.validate(nodes);
    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.INVALID_PORTS),
    ).toBeTruthy();
  });
});
