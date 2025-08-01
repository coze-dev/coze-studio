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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { RecallSlices } from '../src';

export function DemoRecallSlices() {
  const mockLLMOutputs = [
    {
      meta: {
        dataset: {
          id: 111,
          type: '文档',
          name: '笔记软件评测',
        },
        document: {
          id: 222,
          source: '本地',
          name: 'Flomo',
        },
        link: {
          title:
            '[Research for Operations] KK Search Comprehensive User Mental Research Report',
          // cp-disable-next-line
          url: 'https://flomoapp.com/',
          uniq_key: '文档_笔记软件评测_本地_Flomo',
        },
        title:
          '[Research for Operations] KK Search Comprehensive User Mental Research Report',
        score: 0.7,
      },
      content:
        'Flomo：特色是「便捷记录闪念笔记」，可以通过微信服务号、iOS快捷指令和API输入笔记，用于捕捉一闪即逝的想法。还可以不断地在阅读、消费信息的过程中记录，这是一个解释的过程.',
    },
    {
      meta: {
        dataset: {
          id: 111,
          type: '文档',
          name: '笔记软件评测',
        },
        document: {
          id: 222,
          source: '本地',
          name: 'Flomo',
        },
        link: {
          title:
            '[Research for Operations] KK Search Comprehensive User Mental Research Report',
          // cp-disable-next-line
          url: 'https://flomoapp.com/',
          uniq_key: '文档_笔记软件评测_本地_Flomo',
        },
        title:
          '[Research for Operations] KK Search Comprehensive User Mental Research Report',
        score: 0.7,
      },
      content:
        'Flomo：特色是「便捷记录闪念笔记」，可以通过微信服务号、iOS快捷指令和API输入笔记，用于捕捉一闪即逝的想法。还可以不断地在阅读、消费信息的过程中记录，这是一个解释的过程，也是一个向大脑“写入”的过程,特色是「便捷记录闪念笔记」，可以通过微信服务号、iOS快捷指令和API输入笔记，用于捕捉一闪即逝的想法。还可以不断地在阅读、消费信息的过程中记录，这是一个解释的过程，也是一个向大脑“写入”的过程,特色是「便捷记录闪念笔记」，可以通过微信服务号、iOS快捷指令和API输入笔记，用于捕捉一闪即逝的想法。还可以不断地在阅读、消费信息的过程中记录，这是一个解释的过程，也是一个向大脑“写入”的过程.',
    },
  ];
  return <RecallSlices llmOutputs={mockLLMOutputs as unknown as any} />;
}
