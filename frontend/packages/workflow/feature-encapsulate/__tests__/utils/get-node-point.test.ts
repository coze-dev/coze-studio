import { beforeEach, describe, expect, it } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import { getNodePoint } from '../../src/utils';

describe('get-node-point', () => {
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
  });

  it('should get empty node point', () => {
    const node: WorkflowNodeJSON = {
      type: 'test',
      id: '1',
    };
    const point = getNodePoint(node);

    expect(point).toEqual({ x: 0, y: 0 });
  });

  it('should get node point by entity', async () => {
    await workflowDocument.fromJSON(complexMock);
    const node = workflowDocument.getNode('900001') as WorkflowNodeEntity;
    const point = getNodePoint(node);
    expect(point).toEqual({ x: 1674.1103135413448, y: 40.63341482104891 });
  });
});
