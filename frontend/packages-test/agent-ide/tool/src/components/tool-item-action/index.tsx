import { type FC, type PropsWithChildren, type MouseEventHandler } from 'react';

import classNames from 'classnames';

import { ToolTooltip } from '../tool-tooltip';
import { type ToolButtonCommonProps } from '../../typings/button';

type ToolItemActionProps = ToolButtonCommonProps & {
  /** 是否展示hover样式 **/
  hoverStyle?: boolean;
};

export const ToolItemAction: FC<PropsWithChildren<ToolItemActionProps>> = ({
  children,
  disabled,
  tooltips,
  onClick,
  hoverStyle = true,
  ...restProps
}) => {
  const handleClick: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <ToolTooltip content={tooltips} disableFocusListener={disabled}>
      <div
        className={classNames(
          'w-[24px] h-[24px] flex justify-center items-center rounded-mini',
          {
            'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed cursor-pointer':
              !disabled && hoverStyle,
          },
          {
            'coz-fg-dim hover:coz-fg-dim active:coz-fg-dim cursor-not-allowed':
              disabled,
          },
        )}
        onClick={disabled ? undefined : handleClick}
        data-testid={restProps['data-testid']}
      >
        {children}
      </div>
    </ToolTooltip>
  );
};
