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

import { reporterFun } from '../src/reporter/utils';
import { DataNamespace } from '../src/constants';

const global = vi.hoisted(() => ({
  reporter: {
    errorEvent: vi.fn(),
    event: vi.fn(),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  reporter: global.reporter,
}));

describe('reporter utils test', () => {
  test('reporterFun test errorEvent', () => {
    reporterFun({
      event: {
        error: {
          name: 'test',
          message: 'test',
        },
        meta: {
          spaceId: '2333',
        },
        eventName: 'test',
        level: 'error',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      type: 'error',
      namespace: DataNamespace.KNOWLEDGE,
    });
    expect(global.reporter.errorEvent).toHaveBeenCalledWith({
      error: {
        message: 'test',
        name: 'test',
      },
      eventName: 'test',
      level: 'error',
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '2333',
      },
      namespace: 'knowledge',
    });
    expect(global.reporter.event).not.toBeCalled();
  });

  test('reporterFun test event', () => {
    reporterFun({
      event: {
        eventName: 'test',
      },
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      type: 'custom',
      namespace: DataNamespace.KNOWLEDGE,
    });
    expect(global.reporter.event).toHaveBeenCalledWith({
      eventName: 'test',
      meta: {
        documentId: '7347658103988715564',
        knowledgeId: '7327619796571734060',
        spaceId: '7313840473481936940',
      },
      namespace: 'knowledge',
    });
  });
});
