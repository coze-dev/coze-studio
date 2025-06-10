import { vi, describe, it, expect } from 'vitest';
import { type WorkflowJSON } from '@coze-workflow/base';

import { mockNodeResults } from '../__mock_data__/node-results';
import { mockCanvasSchema } from '../__mock_data__/canvas-schema';
import { nodeResultExtractor } from '../../src/utils';

vi.mock('lottie-web', () => ({}));
describe('node-result-extractor test in @coze-workflow/sdk', () => {
  it('should extract node result', async () => {
    const result = nodeResultExtractor({
      nodeResults: mockNodeResults,
      schema: mockCanvasSchema as unknown as WorkflowJSON,
    });
    await expect(result).toMatchFileSnapshot(
      './__snapshots__/node-result-extractor.test.ts.snap',
    );
  });
});
