import { useEffect, useRef } from 'react';

import { useInViewport } from 'ahooks';

import { useMarkMessageRead } from '../../hooks/messages/use-mark-message-read';
import { useChatAreaContext } from '../../hooks/context/use-chat-area-context';
import { useMessageBoxContext } from '../../context/message-box';

export const RevealTrigger = () => {
  const boxBottomRef = useRef<null | HTMLElement>(null);
  const { message } = useMessageBoxContext();
  const reportMarkRead = useMarkMessageRead();
  const { eventCallback } = useChatAreaContext();
  const [inViewport] = useInViewport(() => boxBottomRef.current);

  useEffect(() => {
    if (!inViewport) {
      return;
    }
    reportMarkRead(message);
    eventCallback?.onMessageBottomShow?.(message);
  }, [inViewport]);
  return <i ref={boxBottomRef}></i>;
};

RevealTrigger.displayName = 'RevealTrigger';
