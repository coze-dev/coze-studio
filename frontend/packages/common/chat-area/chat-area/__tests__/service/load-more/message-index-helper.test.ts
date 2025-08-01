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

import { describe, expect, it } from 'vitest';
import { LoadDirection } from '@coze-common/chat-core';

import {
  type LoadMoreEnvConstructParams,
  LoadMoreEnvTools,
  type LoadMoreEnvValues,
} from '../../../src/service/load-more/load-more-env-tools';
import {
  type AbortMessageInfo,
  type HasMoreInfo,
  MessageIndexHelper,
} from '../../../src/service/load-more/helper/message-index-helper';

vi.mock(
  '../../../../chat-area-utils/src/parse-markdown/parse-markdown-to-text.ts',
  () => ({
    parseMarkdown: vi.fn(),
  }),
);
vi.mock('@coze-common/chat-core', () => ({
  LoadDirection: {
    Unknown: 0,
    Prev: 1,
    Next: 2,
  },
}));

// Fix the parameters
vi.mock('../../../src/constants/message', () => ({
  MIN_MESSAGE_INDEX_DIFF_TO_ABORT_CURRENT: 10,
}));

describe('test getShouldAbortLoadedMessage', () => {
  it('mock constant success', async () => {
    expect(
      await import('../../../src/constants/message').then(
        x => x.MIN_MESSAGE_INDEX_DIFF_TO_ABORT_CURRENT,
      ),
    ).toBe(10);
  });

  const envValues = { maxLoadIndex: '0' } as LoadMoreEnvValues;
  const envTools = new LoadMoreEnvTools({
    readEnvValues: () => envValues,
  } as LoadMoreEnvConstructParams);
  const helper = new MessageIndexHelper(envTools);

  it('run with nothing', () => {
    expect(helper.getShouldAbortLoadedMessage([{}])).toMatchObject({
      maxLoadIndex: '0',
      abort: true,
    } satisfies Partial<AbortMessageInfo>);
  });

  it('run with nothing while max loaded is not 0', () => {
    envValues.maxLoadIndex = '5';
    expect(helper.getShouldAbortLoadedMessage([{}])).toMatchObject({
      maxLoadIndex: '5',
      abort: true,
    } satisfies Partial<AbortMessageInfo>);
  });

  it('should not abort', () => {
    envValues.maxLoadIndex = '10';
    expect(
      helper.getShouldAbortLoadedMessage(
        ['11', '12', '20'].map(n => ({ message_index: n })),
      ),
    ).toMatchObject({
      maxLoadIndex: '10',
      abort: false,
    } satisfies Partial<AbortMessageInfo>);
  });

  it('should abort due to big diff', () => {
    envValues.maxLoadIndex = '10';
    expect(
      helper.getShouldAbortLoadedMessage(
        ['35', '30'].map(n => ({ message_index: n })),
      ),
    ).toMatchObject({
      maxLoadIndex: '10',
      abort: true,
      indexInfo: 'start 30, end 35',
    } satisfies Partial<AbortMessageInfo>);
  });

  it('perform well on intersection index', () => {
    envValues.maxLoadIndex = '20';
    expect(
      helper.getShouldAbortLoadedMessage(
        ['5', '30'].map(n => ({ message_index: n })),
      ),
    ).toMatchObject({
      maxLoadIndex: '20',
      abort: false,
      indexInfo: 'start 5, end 30',
    } satisfies Partial<AbortMessageInfo>);
  });
});

describe('test getHasMoreByDirection', () => {
  const fakeEnvTools = {} as LoadMoreEnvTools;
  const helper = new MessageIndexHelper(fakeEnvTools);
  it('accept only safe direction hasMore', () => {
    const prevCase = helper.getHasMoreByDirection(
      { hasmore: true, next_has_more: true },
      LoadDirection.Prev as any,
    );
    expect(prevCase).toMatchObject({ prevHasMore: true } satisfies HasMoreInfo);
    expect(prevCase).not.haveOwnProperty(
      'nextHasMore' satisfies keyof HasMoreInfo,
    );

    const nextCase = helper.getHasMoreByDirection(
      { hasmore: true, next_has_more: true },
      LoadDirection.Next as any,
    );
    expect(nextCase).toMatchObject({ nextHasMore: true } satisfies HasMoreInfo);
    expect(nextCase).not.haveOwnProperty(
      'prevHasMore' satisfies keyof HasMoreInfo,
    );
  });

  it('not adjust both false value', () => {
    expect(
      helper.getHasMoreByDirection(
        { hasmore: false, next_has_more: false },
        LoadDirection.Next as any,
      ),
    ).toMatchObject({
      prevHasMore: false,
      nextHasMore: false,
    } satisfies HasMoreInfo);
  });
});
