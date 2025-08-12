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

import { type FC } from 'react';

import { Typography } from '@coze-arch/coze-design';

export interface DescriptionProps {
  description?: string;
}

const Description: FC<DescriptionProps> = ({ description }) => (
  <Typography.Text
    className="coz-fg-secondary text-[14px] leading-[20px] break-words"
    ellipsis={{
      showTooltip: {
        opts: {
          theme: 'dark',
          content: (
            <Typography.Text
              className="break-words break-all coz-fg-white"
              onClick={e => e.stopPropagation()}
              ellipsis={{ showTooltip: false, rows: 16 }}
            >
              {description}
            </Typography.Text>
          ),
        },
        type: 'tooltip',
      },
      rows: 2,
    }}
  >
    {description}
  </Typography.Text>
);

export default Description;
