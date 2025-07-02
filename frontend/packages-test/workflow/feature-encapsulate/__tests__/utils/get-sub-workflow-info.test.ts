import { describe, it, beforeEach, expect } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import { getSubWorkflowInfo } from '../../src/utils';

describe('get-sub-workflow-info', () => {
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
  });

  it('should get sub workflow info', async () => {
    await workflowDocument.fromJSON(complexMock);
    expect(
      getSubWorkflowInfo(
        workflowDocument.getNode('102906') as WorkflowNodeEntity,
      ),
    ).toEqual({
      spaceId: 'test_space_id',
      workflowId: 'test_workflow_id',
    });

    expect(
      getSubWorkflowInfo(
        workflowDocument.getNode('154702') as WorkflowNodeEntity,
      ),
    ).toBeUndefined();
  });
});
