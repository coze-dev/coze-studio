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
 * 获取向 widget 发送信息函数的 hooks
 */
export const useSendMessageEvent = () => {
  const messageEventService = useMessageEventService();
  const navigate = useIDENavigate();

  /**
   * 向以 uri 为索引的 widget 发送信息
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
   * 向以 uri 为索引的 widget 发送信息，并且打开/激活此 widget
   * 此函数比较常用
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
 * 监听向指定 uri 对应的唯一 widget 发送消息的 hook
 * 监听消息的 widget 一定是知道 this.uri，所以入参无须支持 string
 * 注：虽然 widget.uri 的值是会变得，但其 withoutQuery().toString() 一定是不变的，所以 uri 可以认定为不变
 */
export const useListenMessageEvent = (
  uri: URI,
  cb: (e: MessageEvent) => void,
) => {
  const messageEventService = useMessageEventService();
  // 尽管 uri 对应的唯一 key 不会变化，但 uri 内存地址仍然会变化，这里显式的固化 uri 的不变性
  const uriRef = useRef(uri);

  // 保证 callback 函数的可变性
  const listener = useMemoizedFn(() => {
    const queue = messageEventService.on(uri);
    queue.forEach(cb);
  });

  useEffect(() => {
    // 组件挂在时去队列中取一次，有可能在组件未挂载前已经被发送了消息
    listener();

    const disposable = messageEventService.onSend(e => {
      if (messageEventService.compare(e.uri, uriRef.current)) {
        listener();
      }
    });
    return () => disposable.dispose();
  }, [messageEventService, listener, uriRef]);
};
