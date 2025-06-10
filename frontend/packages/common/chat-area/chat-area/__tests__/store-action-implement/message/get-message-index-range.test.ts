import { describe, expect, it } from 'vitest';

import { type MessageIndexRange } from '../../../src/store/messages';
import { getMessageIndexRange } from '../../../src/store/action-implement/messages/get-message-index-range';

vi.mock(
  '../../../../chat-area-utils/src/parse-markdown/parse-markdown-to-text.ts',
  () => ({
    parseMarkdown: vi.fn(),
  }),
);

const getMsg = (index?: string) => ({ message_index: index });

describe('getMessageIndexRange', () => {
  it('getMessageIndexRange of empty ', () => {
    expect(getMessageIndexRange([])).toMatchObject({
      withNoIndexed: false,
      min: undefined,
      max: undefined,
    } satisfies MessageIndexRange);
  });

  it('getMessageIndexRange normally', () => {
    expect(
      getMessageIndexRange([getMsg(), getMsg('1'), getMsg('2')]),
    ).toMatchObject({
      withNoIndexed: true,
      min: '1',
      max: '2',
    });
  });

  it('getMessageIndexRange single', () => {
    expect(getMessageIndexRange([getMsg('1')])).toMatchObject({
      withNoIndexed: false,
      min: '1',
      max: '1',
    });
  });

  it('reject index "0"', () => {
    expect(getMessageIndexRange([getMsg('0')])).toMatchObject({
      withNoIndexed: true,
      min: undefined,
      max: undefined,
    });
  });

  it('handle index "0" "200" "1"', () => {
    expect(
      getMessageIndexRange([getMsg('0'), getMsg('200'), getMsg('1')]),
    ).toMatchObject({
      withNoIndexed: true,
      min: '1',
      max: '200',
    });
  });
});
