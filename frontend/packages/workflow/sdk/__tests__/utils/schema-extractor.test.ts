/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
