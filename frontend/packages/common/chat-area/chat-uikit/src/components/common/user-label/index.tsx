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

import cs from 'classnames';

import { UIKitTooltip } from '../tooltips';

export interface UserLabelInfo {
  label_name?: string;
  icon_url?: string;
  jump_link?: string;
}

export const UserLabel: FC<{
  userLabel?: UserLabelInfo | null;
}> = ({ userLabel }) => {
  if (!userLabel?.icon_url || !userLabel?.label_name) {
    return null;
  }

  return (
    <UIKitTooltip content={userLabel.label_name} theme="light">
      <div
        className={cs(
          'flex-[0_0_auto] flex items-center h-[20px] ml-[4px]',
          userLabel?.jump_link && 'cursor-pointer',
        )}
        onClick={event => {
          if (userLabel?.jump_link) {
            event?.preventDefault();
            event?.stopPropagation();
            window.open(userLabel?.jump_link, '_blank');
          }
        }}
      >
        <img src={userLabel.icon_url} width={14} height={14} />
      </div>
    </UIKitTooltip>
  );
};

// TODO: Added show background variant
export const UserName: FC<{
  userUniqueName?: string;
  className?: string;
  showBackground: boolean | undefined;
}> = ({ userUniqueName, className, showBackground }) => {
  if (!userUniqueName) {
    return null;
  }

  return (
    <div
      className={cs(
        'coz-fg-secondary text-[12px] leading-[16px] font-normal ml-[4px]',
        showBackground && '!coz-fg-images-secondary',
        className,
      )}
    >
      @{userUniqueName}
    </div>
  );
};
