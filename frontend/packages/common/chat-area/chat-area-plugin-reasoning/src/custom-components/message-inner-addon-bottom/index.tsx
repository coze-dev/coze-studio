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

import { memo, useEffect, useRef, useState, type FC } from 'react';

import { type Message, type ContentType } from '@coze-common/chat-core';
import { MdBoxLazy } from '@coze-arch/bot-md-box-adapter/lazy';

type IProps = Record<'message', Message<ContentType>>;

// export const BizMessageInnerAddonBottom: FC<IProps> = p =>
//   p.message.role === 'assistant' && p.message.reasoning_content ? (
//     <div className="my-[8px] px-[14px] border-solid border-[0] border-l-[0.25em] border-l-[var(--color-border-default)] text-[var(--color-fg-muted)]">
//       {p.message.reasoning_content}
//     </div>
//   ) : null;

export const BizMessageInnerAddonBottom: FC<IProps> = memo(
  p => {
    const [reasoningFinished, setReasoningFinished] = useState(false);
    const ref = useRef(p.message.reasoning_content);

    useEffect(() => {
      setReasoningFinished(ref.current === p.message.reasoning_content);

      return () => {
        ref.current = p.message.reasoning_content;
      };
      // Content used to trigger reasoning rerender
    }, [p.message.reasoning_content, p.message.content]);

    return p.message.role === 'assistant' && p.message.reasoning_content ? (
      <div className="my-[8px]">
        <MdBoxLazy
          markDown={`${p.message.reasoning_content.replace(/^/gm, '> ')}`}
          showIndicator={!p.message.is_finish && !reasoningFinished}
        ></MdBoxLazy>
      </div>
    ) : null;
  },
  (prev, next) =>
    prev.message.role === next.message.role &&
    prev.message.is_finish === next.message.is_finish &&
    prev.message.reasoning_content === next.message.reasoning_content &&
    prev.message.content === next.message.content,
);
