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

export interface NameProps {
  name?: string;
}

const Name: FC<NameProps> = ({ name }) => (
  <Typography.Text
    className="text-[16px] font-[500] leading-[22px]"
    ellipsis={{
      showTooltip: {
        opts: {
          content: <span onClick={e => e.stopPropagation()}>{name}</span>,
          style: { wordBreak: 'break-word' },
          theme: 'dark',
        },
        type: 'tooltip',
      },
      rows: 1,
    }}
  >
    {name}
  </Typography.Text>
);

export default Name;
