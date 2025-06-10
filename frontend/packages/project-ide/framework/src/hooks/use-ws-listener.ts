import { useCallback, useEffect } from 'react';

import { useIDEService } from '@coze-project-ide/client';

import { type WsMessageProps } from '@/types';
import { WsService } from '@/services';

export const useWsListener = (listener: (props: WsMessageProps) => void) => {
  const wsService = useIDEService<WsService>(WsService);

  useEffect(() => {
    const disposable = wsService.onMessageSend(listener);
    return () => {
      disposable.dispose();
    };
  }, []);

  const send = useCallback(
    data => {
      wsService.send(data);
    },
    [wsService],
  );

  return {
    send,
  };
};
