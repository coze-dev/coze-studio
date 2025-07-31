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

import React from 'react';

import { LINE_OFFSET } from '../../../constants/lines';

export default function ArrowRenderer({
  id,
  pos,
  strokeWidth,
}: {
  id: string;
  strokeWidth: number;
  pos: {
    x: number;
    y: number;
  };
}) {
  return (
    <path
      d={`M ${pos.x - LINE_OFFSET},${pos.y - LINE_OFFSET} L ${pos.x},${
        pos.y
      } L ${pos.x - LINE_OFFSET},${pos.y + LINE_OFFSET}`}
      strokeLinecap="round"
      stroke={`url(#${id})`}
      fill="none"
      strokeWidth={strokeWidth}
    />
  );
}
