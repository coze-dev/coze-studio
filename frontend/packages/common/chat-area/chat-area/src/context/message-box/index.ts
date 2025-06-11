import { useContext } from 'react';

import { MessageBoxContext } from './context';

export const useMessageBoxContext = () => {
  const { message, messageUniqKey, meta, ...rest } =
    useContext(MessageBoxContext);
  if (!message || !meta) {
    throw new Error(
      `failed to get message or meta by message id or local_id ${messageUniqKey}`,
    );
  }
  return { message, messageUniqKey, meta, ...rest };
};

/**
 * 如果上下文可能同时出现于 onboarding 等无 messageBoxContext 的场景中；
 * 如果被调用环境属于正常 message box 内，使用常规 useMessageBoxContext
 */
export const useUnsafeMessageBoxContext = () => useContext(MessageBoxContext);
