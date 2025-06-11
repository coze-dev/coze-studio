import { type FC } from 'react';

import classNames from 'classnames';
import { Menu, Popover, IconButton } from '@coze/coze-design';
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
