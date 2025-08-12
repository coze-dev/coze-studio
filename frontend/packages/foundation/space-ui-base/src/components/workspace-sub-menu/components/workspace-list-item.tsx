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

import { useNavigate } from 'react-router-dom';
import { type ReactNode, type FC } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useSpaceStore } from '@coze-foundation/space-store';
import { localStorageService } from '@coze-foundation/local-storage';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

export interface IWorkspaceListItem {
  icon?: ReactNode;
  activeIcon?: ReactNode;
  title?: () => string;
  path?: string;
  dataTestId?: string;
}

interface IWorkspaceListItemProps extends IWorkspaceListItem {
  currentSubMenu?: string;
}

export const WorkspaceListItem: FC<IWorkspaceListItemProps> = ({
  icon,
  activeIcon,
  type,
  title,
  path,
  currentSubMenu,
  dataTestId,
}) => {
  const navigate = useNavigate();
  const { spaceId } = useSpaceStore(
    useShallow(store => ({
      spaceId: store.space.id,
    })),
  );

  if (type === 'title') {
    return (
      <div className="w-full flex items-start gap-[8px] mt-[16px] pl-[8px]">
        <div className="coz-fg-secondary text-[12px] leading-[20px]">
          {title?.()}
        </div>
      </div>
    );
  }

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
      data-testid={dataTestId}
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
