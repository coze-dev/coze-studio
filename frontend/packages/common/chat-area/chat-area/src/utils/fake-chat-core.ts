import type ChatCore from '@coze-common/chat-core';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';

const fakeChatCoreMark = Symbol('fake-chat-core');

export const getFakeChatCore = () => {
  const fakeCore = {} as unknown as ChatCore;

  return new Proxy(fakeCore, {
    get(_, key) {
      if (key === fakeChatCoreMark) {
        return true;
      }

      const callTip = `This error is caused when calling: ${String(key)}`;
      safeAsyncThrow(
        `!!!chatCore not found, make sure to call chatArea hooks inside chatAreaProvider!!! ${callTip}`,
      );

      // 已经最大化兼容了，我感觉
      return () => Object.create(null);
    },
  });
};

export const getIsFakeChatCore = (core: ChatCore) =>
  (core as unknown as { [fakeChatCoreMark]: boolean })[fakeChatCoreMark];
