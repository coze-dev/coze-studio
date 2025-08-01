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
