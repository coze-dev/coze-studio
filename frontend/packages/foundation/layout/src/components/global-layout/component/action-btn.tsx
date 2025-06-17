import { useState, type FC } from 'react';

import classNames from 'classnames';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { reportNavClick } from '../utils';
import { type LayoutButtonItem } from '../types';

export const GlobalLayoutActionBtn: FC<LayoutButtonItem> = ({
  icon,
  iconClass,
  onClick,
  tooltip,
  dataTestId,
  className,
  portal,
  renderButton,
}) => {
  const [visible, setVisible] = useState(false);

  const onButtonClick = () => {
    setVisible(false);
    reportNavClick(tooltip);
    onClick?.();
  };

  const btn = renderButton ? (
    renderButton({
      onClick: onButtonClick,
      icon,
      dataTestId,
    })
  ) : (
    <IconButton
      color="secondary"
      size="large"
      className={classNames(className, { '!h-full': !!iconClass })}
      icon={
        <div
          className={classNames(
            'text-[20px] coz-fg-primary h-[20px]',
            iconClass,
          )}
        >
          {icon}
        </div>
      }
      onClick={onButtonClick}
      data-testid={dataTestId}
    />
  );
  // 如果 tooltip 为空，则不显示 tooltip
  return (
    <>
      {tooltip ? (
        <Tooltip
          content={tooltip}
          position="right"
          clickToHide
          visible={visible}
          onVisibleChange={setVisible}
        >
          {btn}
        </Tooltip>
      ) : (
        btn
      )}
      {portal}
    </>
  );
};
