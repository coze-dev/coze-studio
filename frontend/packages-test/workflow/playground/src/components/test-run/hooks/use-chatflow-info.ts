import { useState, useEffect } from 'react';

import { useService } from '@flowgram-adapter/free-layout-editor';

import { ChatflowService } from '@/services';

export const useChatflowInfo = () => {
  const chatflowService = useService<ChatflowService>(ChatflowService);
  const [sessionInfo, setSessionInfo] = useState(chatflowService.selectItem);
  const [conversationInfo, setConversationInfo] = useState(
    chatflowService.selectConversationItem,
  );

  useEffect(() => {
    const disposable = chatflowService.onSelectItemChange(info =>
      setSessionInfo(info),
    );
    const conversationDisposable =
      chatflowService.onSelectConversationItemChange(info => {
        setConversationInfo(info);
      });
    return () => {
      disposable?.dispose?.();
      conversationDisposable?.dispose?.();
    };
  }, []);

  return { sessionInfo, conversationInfo };
};
