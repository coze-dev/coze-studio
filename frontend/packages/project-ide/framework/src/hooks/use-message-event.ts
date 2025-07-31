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

import { useCallback, useEffect, useRef } from 'react';

import { useMemoizedFn } from 'ahooks';
import { URI, useIDEService } from '@coze-project-ide/client';

import { getURLByURI } from '../utils';
import { MessageEventService, type MessageEvent } from '../services';
import { URI_SCHEME } from '../constants';
import { useIDENavigate } from './use-ide-navigate';

export const useMessageEventService = () =>
  useIDEService<MessageEventService>(MessageEventService);

/**
 * Get hooks for the function that sends information to the widget
 */
export const useSendMessageEvent = () => {
  const messageEventService = useMessageEventService();
  const navigate = useIDENavigate();

  /**
   * Send a message to a widget indexed by URI
   */
  const send = useCallback(
    <T>(target: string | URI, data: MessageEvent<T>) => {
      const uri =
        typeof target === 'string'
          ? new URI(`${URI_SCHEME}://${target}`)
          : target;
      messageEventService.send(uri, data);
    },
    [messageEventService],
  );

  /**
   * Send a message to a widget indexed with URIs, and open/activate the widget
   * This function is more commonly used
   */
  const sendOpen = useCallback(
    <T>(target: string | URI, data: MessageEvent<T>) => {
      const uri =
        typeof target === 'string'
          ? new URI(`${URI_SCHEME}://${target}`)
          : target;
      messageEventService.send(uri, data);
      navigate(getURLByURI(uri));
    },
    [messageEventService, navigate],
  );

  return { send, sendOpen };
};

/**
 * Listens for hooks that send messages to the unique widget corresponding to the specified URI
 * The widget listening to the message must know this.uri, so imported parameters do not need to support string.
 * Note: Although the value of widget.uri will change, its withoutQuery ().toString () must be unchanged, so uri can be considered unchanged
 */
export const useListenMessageEvent = (
  uri: URI,
  cb: (e: MessageEvent) => void,
) => {
  const messageEventService = useMessageEventService();
  // Although the unique key corresponding to the URI does not change, the URI memory address will still change, and the invariance of the cured URI is explicit here
  const uriRef = useRef(uri);

  // Guarantee the variability of the callback function
  const listener = useMemoizedFn(() => {
    const queue = messageEventService.on(uri);
    queue.forEach(cb);
  });

  useEffect(() => {
    // When the component is hung, go to the queue to pick it up once. It is possible that the message has been sent before the component is not mounted.
    listener();

    const disposable = messageEventService.onSend(e => {
      if (messageEventService.compare(e.uri, uriRef.current)) {
        listener();
      }
    });
    return () => disposable.dispose();
  }, [messageEventService, listener, uriRef]);
};
