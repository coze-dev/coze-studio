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
