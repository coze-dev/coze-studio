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

import { parseMarkdownToGrabNode } from '@coze-common/text-grab';
import {
  ContentType,
  type CustomTextMessageInnerTopSlot,
} from '@coze-common/chat-area';

import { QuoteNode } from '../quote-node';
import { getReferFromMessage } from '../../utils/get-refer-from-message';
import { QuoteTopUI } from './quote-top-ui';

export const RemoteQuoteInnerTopSlot: CustomTextMessageInnerTopSlot = ({
  message,
}) => {
  // It was not sent locally with server level.
  const refer = getReferFromMessage(message);

  if (!refer) {
    return null;
  }

  if (refer.type === ContentType.Image) {
    return (
      <QuoteTopUI>
        <img className="w-[24px] h-[24px] rounded-[4px]" src={refer.url} />
      </QuoteTopUI>
    );
  }

  // Try to parse ast.
  const nodeList = parseMarkdownToGrabNode(refer.text);

  return (
    <QuoteTopUI>
      <QuoteNode nodeList={nodeList} theme="white" />
    </QuoteTopUI>
  );
};
