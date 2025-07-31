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

import { Space } from '@coze-arch/coze-design';

import {
  WorkspaceListItem,
  type IWorkspaceListItem,
} from './workspace-list-item';

interface WorkspaceListProps {
  menus: Array<IWorkspaceListItem>;
  currentSubMenu?: string;
}

export const WorkspaceList: FC<WorkspaceListProps> = ({
  menus,
  currentSubMenu,
}: WorkspaceListProps) => (
  <div className="w-full mt-[16px]">
    <Space vertical spacing={4} className="w-full">
      {menus.map((item, index) => (
        <WorkspaceListItem
          {...item}
          key={index}
          currentSubMenu={currentSubMenu}
        />
      ))}
    </Space>
  </div>
);
