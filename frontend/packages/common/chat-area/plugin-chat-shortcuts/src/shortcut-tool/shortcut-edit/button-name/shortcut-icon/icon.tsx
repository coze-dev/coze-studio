import { type FC } from 'react';

import cls from 'classnames';
import { type FileInfo } from '@coze-arch/bot-api/playground_api';

import DefaultIcon from '../../../../assets/shortcut-icon-default.svg';

export interface ShortcutIconProps {
  icon?: FileInfo;
  className?: string;
  width?: number;
  height?: number;
}
const DEFAULT_ICON_SIZE = 28;

const DefaultIconInfo = {
  url: DefaultIcon,
};

export const Icon: FC<ShortcutIconProps> = props => {
  const { icon, width, height, className } = props;
  return (
    <div className="flex items-center">
      <img
        className={cls(
          'rounded-[6px] p-1 coz-mg-primary hover:coz-mg-secondary-hovered mr-1 cursor-pointer',
          className,
        )}
        style={{
          width: width ?? DEFAULT_ICON_SIZE,
          height: height ?? DEFAULT_ICON_SIZE,
        }}
        alt="icon"
        src={icon?.url || DefaultIconInfo.url}
      />
    </div>
  );
};
