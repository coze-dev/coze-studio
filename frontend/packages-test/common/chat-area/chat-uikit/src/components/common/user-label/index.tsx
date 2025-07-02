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

// TODO: 增加 show background 变体
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
