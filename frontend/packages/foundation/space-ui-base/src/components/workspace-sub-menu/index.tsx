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

import { type ReactNode } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { Space, Skeleton } from '@coze-arch/coze-design';
import { useSpaceStore } from '@coze-foundation/space-store';

import { type IWorkspaceListItem } from './components/workspace-list-item';
import { WorkspaceList } from './components/workspace-list';
// import { FavoritesList } from './components/favorites-list';

import './components/list.css';

interface IWorkspaceSubMenuProps {
  header: ReactNode;
  menus: Array<IWorkspaceListItem>;
  currentSubMenu?: string;
}

export const WorkspaceSubMenu = ({
  header,
  menus,
  currentSubMenu,
}: IWorkspaceSubMenuProps) => {
  const { spaceList, loading } = useSpaceStore(
    useShallow(state => ({
      currentSpace: state.space,
      spaceList: state.spaceList,
      loading: !!state.loading || !state.inited,
    })),
  );

  const hasSpace = spaceList.length > 0;

  return (
    <Skeleton loading={loading} active placeholder={<Skeleton.Paragraph />}>
      <Space spacing={4} vertical className="w-full h-full">
        <div className="flex-none w-full">{header}</div>
        {hasSpace ? (
          <>
            <div className="flex-none w-full">
              <WorkspaceList menus={menus} currentSubMenu={currentSubMenu} />
            </div>
            {/* <div className="flex-grow max-h-full overflow-y-auto w-full mt-[24px]">
              <FavoritesList />
            </div> */}
          </>
        ) : null}
      </Space>
    </Skeleton>
  );
};

export { IWorkspaceListItem };
