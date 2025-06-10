import { useNavigate } from 'react-router-dom';
import { type ReactNode, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { localStorageService } from '@coze-foundation/local-storage';
import { useSpaceStore } from '@coze-foundation/space-store';

export interface IWorkspaceListItem {
  icon?: ReactNode;
  activeIcon?: ReactNode;
  title?: () => string;
  path?: string;
}

interface IWorkspaceListItemProps extends IWorkspaceListItem {
  currentSubMenu?: string;
}

export const WorkspaceListItem: FC<IWorkspaceListItemProps> = ({
  icon,
  activeIcon,
  title,
  path,
  currentSubMenu,
}) => {
  const navigate = useNavigate();
  const { spaceId } = useSpaceStore(
    useShallow(store => ({
      spaceId: store.space.id,
    })),
  );
  return spaceId ? (
    <div
      onClick={() => {
        sendTeaEvent(EVENT_NAMES.coze_space_sidenavi_ck, {
          item: title?.() || 'unknown-workspace-submenu',
          navi_type: 'second',
          need_login: true,
          have_access: true,
        });
        localStorageService.setValue('workspace-subMenu', path);
        navigate(`/space/${spaceId}/${path}`);
      }}
      className={classNames(
        'flex items-center gap-[8px]',
        'transition-colors',
        'rounded-[8px]',
        'h-[32px] w-full',
        'px-[8px]',
        'cursor-pointer',
        'group',
        'hover:coz-mg-secondary-hovered',
        {
          'coz-bg-primary': path === currentSubMenu,
          'coz-fg-plus': path === currentSubMenu,
          'coz-fg-primary': path !== currentSubMenu,
        },
      )}
      id={`workspace-submenu-${path}`}
    >
      <div className="text-[14px]">
        <div className="w-[16px] h-[16px]">
          {path === currentSubMenu ? activeIcon : icon}
        </div>
      </div>
      <div
        className={classNames(
          'flex-1',
          'text-[14px]',
          'leading-[20px]',
          'font-[500]',
        )}
      >
        {title?.()}
      </div>
    </div>
  ) : null;
};
