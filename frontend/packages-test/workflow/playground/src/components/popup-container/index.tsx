import React, {
  type PropsWithChildren,
  type ReactElement,
  useMemo,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';

import s from './index.module.less';

export const PopupContainer: React.FC<
  PropsWithChildren<{
    className?: string;
    containerName?: string;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }>
> = ({
  className,
  children,
  containerName,
  containerClassName,
  containerStyle,
}) => {
  const _nanoid = useMemo(
    () => `${containerName || 'popup_container'}_${nanoid()}`,
    [containerName],
  );
  const _children = React.cloneElement(children as unknown as ReactElement, {
    getPopupContainer: () => document.getElementById(_nanoid) as HTMLElement,
  });
  return (
    <div className={classNames(s['popup-container'], className)}>
      {_children}
      <div
        id={_nanoid}
        style={containerStyle}
        className={classNames([
          'nowheel',
          'popup-container-id',
          containerClassName,
        ])}
      ></div>
    </div>
  );
};

export default PopupContainer;
