import { vi, describe, it, expect } from 'vitest';
import {
  type SchemaExtractorConfig,
  SchemaExtractorParserName,
  StandardNodeType,
  type WorkflowJSON,
} from '@coze-workflow/base';

import { mockCanvasSchema } from '../__mock_data__/canvas-schema';
import { schemaExtractor } from '../../src/utils';

vi.mock('lottie-web', () => ({}));

const config: SchemaExtractorConfig = {
  [StandardNodeType.Code]: [
    {
      name: 'title',
      path: 'nodeMeta.title',
    },
  ],
  [StandardNodeType.LLM]: [
    {
      name: 'title',
      path: 'nodeMeta.title',
    },
    {
      name: 'llmParam',
      path: 'inputs.llmParam',
      parser: SchemaExtractorParserName.LLM_PARAM,
    },
  ],
};

describe('schema-extractor test in @coze-workflow/sdk', () => {
  it('should extract schema result', async () => {
    const result = schemaExtractor({
      schema: mockCanvasSchema as unknown as WorkflowJSON,
      config,
    });
    await expect(result).toMatchFileSnapshot(
      './__snapshots__/schema-extractor.test.ts.snap',
    );
  });
});
