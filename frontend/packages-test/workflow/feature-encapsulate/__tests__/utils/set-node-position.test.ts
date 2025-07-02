import { describe, expect, it } from 'vitest';
import { type WorkflowNodeJSON } from '@flowgram-adapter/free-layout-editor';

import { setNodePosition } from '../../src/utils';

describe('set-node-position', () => {
  it('should set node position', () => {
    const node: WorkflowNodeJSON = {
      type: 'test',
      id: '1',
    };
    setNodePosition(node, {
      x: 10,
      y: 10,
    });

    expect(node.meta?.position).toEqual({ x: 10, y: 10 });
  });
});
