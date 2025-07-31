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

import { expect, describe, test, vi } from 'vitest';

import { dataReporter } from '../src/reporter/data-reporter';
import { DataNamespace } from '../src/constants';

const global = vi.hoisted(() => ({
  reportFn: vi.fn(),
}));

vi.stubGlobal('location', {
  pathname:
    '/space/7313840473481936940/knowledge/7327619796571734060/7347658103988715564',
});

vi.mock('../src/reporter/utils.ts', () => ({
  reporterFun: global.reportFn,
}));

vi.mock('@coze-arch/logger', () => ({}));

describe('test report func', () => {
  test('errorEvent', () => {
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      error: {},
      level: 'error',
      eventName: 'test',
    } as any);
    expect(global.reportFn).toHaveBeenCalledWith({
      event: {
        error: {},
        eventName: 'test',
        level: 'error',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      namespace: 'knowledge',
      type: 'error',
    });
  });
  test('event', () => {
    dataReporter.event(DataNamespace.KNOWLEDGE, {
      eventName: 'test',
    });
    expect(global.reportFn).toHaveBeenCalledWith({
      event: {
        eventName: 'test',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      namespace: 'knowledge',
      type: 'custom',
    });
  });
});
