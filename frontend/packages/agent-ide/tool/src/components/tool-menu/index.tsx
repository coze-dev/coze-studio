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

import classNames from 'classnames';
import { Menu, Popover, IconButton } from '@coze-arch/coze-design';
import { IconMenu } from '@coze-arch/bot-icons';

import { ToolMenuDropdownMenu } from '../tool-menu-dropdown-menu';
import { GuidePopover } from './guide-popover';

import s from './index.module.less';

interface IProps {
  visible?: boolean;
  newbieGuideVisible?: boolean;
  onNewbieGuidePopoverClose?: () => void;
  rePosKey: number;
}

export const ToolMenu: FC<IProps> = ({
  visible = true,
  onNewbieGuidePopoverClose,
  newbieGuideVisible,
  rePosKey,
}) => {
  const onButtonClick = () => {
    if (!newbieGuideVisible) {
      return;
    }

    onNewbieGuidePopoverClose?.();
  };

  return (
    <div
      className={classNames({
        hidden: !visible,
        [s['guide-popover'] || '']: true,
      })}
    >
      <Popover
        content={<GuidePopover onClose={onNewbieGuidePopoverClose} />}
        trigger="custom"
        visible={newbieGuideVisible && visible}
        showArrow
        onClickOutSide={onButtonClick}
      >
        <Menu
          trigger="click"
          position="bottomRight"
          render={<ToolMenuDropdownMenu />}
          rePosKey={rePosKey}
        >
          <IconButton
            size="default"
            color="secondary"
            icon={<IconMenu className="text-[16px]" />}
            onClick={onButtonClick}
          />
        </Menu>
      </Popover>
    </div>
  );
};
