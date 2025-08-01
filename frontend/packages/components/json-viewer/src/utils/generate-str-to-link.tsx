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
   * Stricter URL matching rules to prevent over-matching
   * Protocol: http, https
   * Domain names: -, a-z, A-Z, 0-9 are allowed, where - cannot start, and the length of each level of domain name will not exceed 63.
   * Port: Support with port 0 - 65535
   * URL: Strict does not match the text before translation such as Chinese, otherwise the entire string will be recognized once hit
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
   * Cut string, url nested as link style, cutting steps:
   * 1. Match all URLs in the string
   * 2. Reverse matches, cut from the end, the reason is that match.index counts from scratch, and cut from scratch increases the amount of calculation
   * 3. Each match is cut into three sections, the head and tail are ordinary strings, and the middle is url.
   * 4. Push to the stack in the order of end, url, and start, and the next match will directly take start and continue to cut
   * 5. Do a reverse sequence after the cutting is completed
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
