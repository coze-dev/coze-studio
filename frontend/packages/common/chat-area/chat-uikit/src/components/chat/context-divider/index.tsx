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

import classNames from 'classnames';
import { Divider, Typography } from '@coze-arch/coze-design';

interface ContextDividerProps {
  className?: string;
  text?: string;
}

export const ContextDivider = ({ text, className }: ContextDividerProps) => (
  <Divider className={classNames(className, 'w-full my-24px ')} align="center">
    <Typography.Paragraph
      ellipsis={{
        showTooltip: {
          opts: {
            content: text,
            style: {
              wordBreak: 'break-word',
            },
          },
        },
        rows: 2,
      }}
      className="coz-fg-dim whitespace-pre-wrap text-center text-base leading-[16px] font-normal break-words"
    >
      {text}
    </Typography.Paragraph>
  </Divider>
);
