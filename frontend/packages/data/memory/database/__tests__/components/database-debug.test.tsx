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

import { useShallow } from 'zustand/react/shallow';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';

import { DatabaseDebug } from '../../src/components/database-debug';

vi.mock('@coze-studio/bot-detail-store/bot-skill', () => ({
  useBotSkillStore: vi.fn(selector => {
    if (typeof selector === 'function') {
      return selector({
        databaseList: [
          {
            id: 'db1',
            name: 'Test Database',
            tableId: 'table1',
            tables: [
              {
                id: 'table1',
                name: 'Test Table',
                fields: [
                  {
                    id: 'field1',
                    name: 'Test Field',
                    type: 'string',
                  },
                ],
              },
            ],
          },
        ],
      });
    }
    return {
      databaseList: [],
    };
  }),
}));

vi.mock('../../src/components/database-debug/multi-table', () => ({
  default: vi.fn(() => <div>MultiTable</div>),
}));

vi.mock('@coze-studio/bot-detail-store/bot-info', () => ({
  useBotInfoStore: vi.fn(() => 'test-bot-id'),
}));

// Mock zustand stores
vi.mock('@coze-studio/bot-detail-store/bot-skill', () => ({
  useBotSkillStore: vi.fn(selector => {
    if (typeof selector === 'function') {
      return selector({
        databaseList: [
          {
            id: 'db1',
            name: 'Test Database',
            tableId: 'table1',
            tables: [
              {
                id: 'table1',
                name: 'Test Table',
                fields: [
                  {
                    id: 'field1',
                    name: 'Test Field',
                    type: 'string',
                  },
                ],
              },
            ],
          },
        ],
      });
    }
    return {
      databaseList: [],
    };
  }),
}));

vi.mock('@coze-studio/bot-detail-store/bot-info', () => ({
  useBotInfoStore: vi.fn(() => 'test-bot-id'),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: vi.fn(fn => fn),
}));

describe('DatabaseDebug', () => {
  it('should use correct store selectors', () => {
    render(<DatabaseDebug />);
    expect(useBotInfoStore).toHaveBeenCalled();
    expect(useBotSkillStore).toHaveBeenCalled();
    expect(useShallow).toHaveBeenCalled();
  });
});
