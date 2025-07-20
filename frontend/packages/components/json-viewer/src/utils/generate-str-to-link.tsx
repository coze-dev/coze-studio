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
 
import { type ReactNode } from 'react';

import { isString } from 'lodash-es';
import { Typography } from '@coze-arch/bot-semi';

import { generateStrAvoidEscape } from './generate-str-avoid-escape';

const { Text } = Typography;

export const generateStr2Link = (str: string, avoidEscape?: boolean) => {
  if (str === '') {
    return [''];
  }

  if (avoidEscape) {
    str = generateStrAvoidEscape(str);
  }

  /**
   * 更严格的 url 匹配规则，防止过度匹配
   * 协议：http、https
   * 域名：允许使用 -、a-z、A-Z、0-9，其中 - 不能开头，每一级域名长度不会超过 63
   * 端口：支持带端口 0 - 65535
   * URL：严格型不匹配中文等转译前的文字，否则一旦命中将会识别整段字符串
   */
  const urlReg = new RegExp(
    'http(s)?://' +
      '[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+' +
      '(:[0-9]{1,5})?' +
      '[-a-zA-Z0-9()@:%_\\+.~#?&//=]*',
    'g',
  );
  const matches = [...str.matchAll(urlReg)];
  /**
   * 切割字符串，url 嵌套为 link 的样式，切割步骤：
   * 1. 匹配字符串中所有的 url
   * 2. 倒序 matches，从末尾开始切，原因是 match.index 是从头开始计数，从头切增加计算量
   * 3. 每一个 match 切两刀成三段，头尾是普通字符串，中间为 url
   * 4. 按照 end、url、start 的顺序 push 到栈中，下次 match 会直接取 start 继续切
   * 5. 切割完成后做一次倒序
   */
  return matches
    .reverse()
    .reduce<ReactNode[]>(
      (nodes, match) => {
        const lastNode = nodes.pop();
        if (!isString(lastNode)) {
          return nodes.concat(lastNode);
        }
        const startIdx = match.index || 0;
        const endIdx = startIdx + match[0].length;
        const startStr = lastNode.slice(0, startIdx);
        const endStr = lastNode.slice(endIdx);
        return nodes.concat(
          endStr,
          <Text link={{ href: match[0], target: '_blank' }}>{match[0]}</Text>,
          startStr,
        );
      },
      [str],
    )
    .reverse();
};
