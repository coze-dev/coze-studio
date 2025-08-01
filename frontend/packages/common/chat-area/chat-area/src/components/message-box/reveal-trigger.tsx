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
