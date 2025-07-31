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

import { describe, it, expect, vi } from 'vitest';
import { globalVars } from '@coze-arch/web-context';

import { getExecuteDraftBotRequestId } from '../../src/utils/execute-draft-bot-request-id';

// Simulate globalVars
vi.mock('@coze-arch/web-context', () => ({
  globalVars: {
    LAST_EXECUTE_ID: 'mock-execute-id',
  },
}));

describe('execute-draft-bot-request-id utils', () => {
  describe('getExecuteDraftBotRequestId', () => {
    it('应该返回 globalVars.LAST_EXECUTE_ID', () => {
      const result = getExecuteDraftBotRequestId();

      expect(result).toBe('mock-execute-id');
    });

    it('应该在 LAST_EXECUTE_ID 变化时返回新值', () => {
      // Modify the simulated LAST_EXECUTE_ID
      (globalVars as any).LAST_EXECUTE_ID = 'new-execute-id';

      const result = getExecuteDraftBotRequestId();

      expect(result).toBe('new-execute-id');

      // Restore the original value to avoid affecting other tests
      (globalVars as any).LAST_EXECUTE_ID = 'mock-execute-id';
    });
  });
});
