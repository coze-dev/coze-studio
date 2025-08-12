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

import { Avatar } from '@coze-arch/coze-design';

export interface CreatorProps {
  avatar?: string;
  name?: string;
  extra?: string;
}

export const Creator: FC<CreatorProps> = ({ avatar, name, extra }) => (
  <div className="flex items-center gap-x-[4px] h-[16px] coz-fg-secondary text-[12px] leading-16px">
    {/* The open-source version has no multi-person collaboration function and does not display resource owner information */}
    {IS_OPEN_SOURCE ? null : (
      <>
        <Avatar className="w-[16px] h-[16px] flex-shrink-0" src={avatar} />
        <div className="text-nowrap">{name}</div>
        <div className="w-3px h-3px rounded-full bg-[var(--coz-fg-secondary)]" />
      </>
    )}
    <div className="text-ellipsis whitespace-nowrap overflow-hidden">
      {extra}
    </div>
  </div>
);
