import { type FC, type ReactNode, useState } from 'react';

import { omit } from 'lodash-es';
import classNames from 'classnames';
import { IconCozArrowDownFill } from '@coze/coze-design/icons';
import {
  Menu,
  Button,
  Tooltip,
  type ButtonProps,
  type MenuProps,
} from '@coze/coze-design';

import { getButtonPaddingStyle } from './button-padding-table';

export interface DebugDropdownButtonProps {
  withBackground: boolean;
  hideTitle: boolean;
  tooltipContent?: ReactNode;
  menuContent?: ReactNode;
  menuProps?: Omit<MenuProps, 'render' | 'clickToHide'>;
  buttonProps?: Omit<ButtonProps, 'className' | 'icon'>;
  icon?: ReactNode;
  clickToHide?: boolean;
  children?: ReactNode;
  className?: string;
  active?: boolean;
}

export const DebugDropdownButton: FC<DebugDropdownButtonProps> = props => {
  const {
    withBackground,
    hideTitle,
    menuContent,
    children,
    buttonProps,
    menuProps,
    className,
    icon,
    tooltipContent,
    active,
    clickToHide = true,
  } = props;
  const [isHovering, setIsHovering] = useState(false);

  const withDropdown = !!menuContent;
  const paddingStyle = getButtonPaddingStyle({
    withDropdown,
    withTitle: !hideTitle,
  });
  const { style: buttonStyle, ...restButtonProps } = buttonProps || {};
  const Trigger = (
    <Button
      className={classNames(
        className,
        withBackground && '!coz-fg-images-white',
        'mr-[4px]',
      )}
      color={active ? 'highlight' : 'secondary'}
      icon={null}
      style={{ ...paddingStyle, ...buttonStyle }}
      onMouseEnter={evt => {
        restButtonProps?.onMouseEnter?.(evt);
        setIsHovering(true);
      }}
      onMouseLeave={evt => {
        restButtonProps?.onMouseLeave?.(evt);
        setIsHovering(false);
      }}
      {...omit(restButtonProps, 'onMouseEnter', 'onMouseLeave')}
    >
      <div className="flex items-center text-[14px] gap-[3px]">
        <span className="inline-flex text-[16px] items-center">{icon}</span>
        {hideTitle ? null : children}
        {withDropdown ? <IconCozArrowDownFill className="!ml-0" /> : null}
      </div>
    </Button>
  );

  return (
    <Tooltip
      content={tooltipContent || children}
      trigger="custom"
      visible={isHovering}
    >
      {withDropdown ? (
        <Menu clickToHide={clickToHide} render={menuContent} {...menuProps}>
          {Trigger}
        </Menu>
      ) : (
        Trigger
      )}
    </Tooltip>
  );
};
