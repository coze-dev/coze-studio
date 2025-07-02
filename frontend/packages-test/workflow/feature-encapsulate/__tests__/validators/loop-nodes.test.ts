import { describe, it, expect, beforeEach } from 'vitest';
import { StandardNodeType } from '@coze-workflow/base';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import { baseMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateValidateErrorCode,
  EncapsulateValidateService,
} from '../../src/validate';

describe('loop-nodes', () => {
  let encapsulateValidateService: EncapsulateValidateService;
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    encapsulateValidateService = container.get<EncapsulateValidateService>(
      EncapsulateValidateService,
    );
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    workflowDocument.fromJSON(baseMock);
  });

  it('should validate loop nodes error', async () => {
    const breakNode = await workflowDocument.createWorkflowNodeByType(
      StandardNodeType.Break,
    );
    const res = await encapsulateValidateService.validate([breakNode]);

    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.INVALID_LOOP_NODES),
    ).toBeTruthy();
  });
});
