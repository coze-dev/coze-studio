import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import { baseMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateValidateErrorCode,
  EncapsulateValidateService,
} from '../../src/validate';

describe('start-end', () => {
  let encapsulateValidateService: EncapsulateValidateService;
  let workflowDocument: WorkflowDocument;
  beforeEach(async () => {
    const container = createContainer();
    encapsulateValidateService = container.get<EncapsulateValidateService>(
      EncapsulateValidateService,
    );
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    await workflowDocument.fromJSON(baseMock);
  });

  it('should validate return no-start-end error', async () => {
    const startNode = workflowDocument.getNode('1')!;
    const res = await encapsulateValidateService.validate([startNode]);

    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.NO_START_END),
    ).toBeTruthy();
  });
});
