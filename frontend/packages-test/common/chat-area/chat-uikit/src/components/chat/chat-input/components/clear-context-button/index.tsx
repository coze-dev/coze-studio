import { type ReactNode, type FC } from 'react';

import classNames from 'classnames';
import { IconCozChatPlus } from '@coze-arch/coze-design/icons';
import { Layout } from '@coze-common/chat-uikit-shared';

import { UIKitTooltip } from '../../../../common/tooltips';
import { OutlinedIconButton } from '../../../../common';

interface IProps {
  isDisabled?: boolean;
  tooltipContent?: ReactNode;
  onClick: () => void;
  layout: Layout;
  className: string;
  showBackground: boolean;
}

const ClearContextButton: FC<IProps> = props => {
  const {
    isDisabled,
    tooltipContent,
    onClick,
    layout,
    className,
    showBackground,
  } = props;

  return (
    <UIKitTooltip
      content={tooltipContent}
      hideToolTip={layout === Layout.MOBILE}
    >
      <OutlinedIconButton
        data-testid="chat-input-clear-context-button"
        showBackground={showBackground}
        disabled={isDisabled}
        icon={<IconCozChatPlus className="text-18px" />}
        size="default"
        onClick={onClick}
        className={classNames('mr-12px', '!rounded-full', className)}
      />
    </UIKitTooltip>
  );
};

export default ClearContextButton;
