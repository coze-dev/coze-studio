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

import { IconCozExpand, IconCozMinimize } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
export const ExpandBtn = ({
  onClick,
  expand,
}: {
  onClick?: () => void;
  expand?: boolean;
}) => (
  <div className="flex flex-row items-center self-stretch h-[24px]">
    <IconButton
      className="!block"
      size="small"
      color={expand ? 'highlight' : 'secondary'}
      onClick={() => onClick?.()}
      icon={
        expand ? (
          <IconCozMinimize className="text-sm" />
        ) : (
          <IconCozExpand className="text-sm" />
        )
      }
    />
  </div>
);
