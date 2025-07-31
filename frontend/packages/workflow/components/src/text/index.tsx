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

/** Text component, beyond automatic... and show tooltip */
import { type FC } from 'react';

import { Typography } from '@coze-arch/coze-design';
import { type Position } from '@coze-arch/bot-semi/Tooltip';

interface IText {
  text?: string;
  rows?: number;
  className?: string;
  tooltipPosition?: Position;
}
export const Text: FC<IText> = props => {
  const { text = '', rows = 1, className, tooltipPosition } = props;
  return (
    <Typography.Paragraph
      ellipsis={{
        rows,
        showTooltip: {
          type: 'tooltip',
          opts: {
            style: {
              width: '100%',
              wordBreak: 'break-word',
            },
            position: tooltipPosition,
          },
        },
      }}
      className={className}
    >
      {text}
    </Typography.Paragraph>
  );
};
