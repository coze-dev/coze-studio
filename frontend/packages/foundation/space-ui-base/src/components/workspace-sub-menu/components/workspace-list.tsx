import { type FC } from 'react';

import { Space } from '@coze/coze-design';

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
