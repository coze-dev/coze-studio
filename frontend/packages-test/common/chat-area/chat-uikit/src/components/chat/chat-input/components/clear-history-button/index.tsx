import { type ReactNode, type FC } from 'react';

import classNames from 'classnames';
import { IconCozBroom } from '@coze-arch/coze-design/icons';
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

const ClearHistoryButton: FC<IProps> = props => {
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
        data-testid="bot-edit-debug-chat-clear-button"
        showBackground={showBackground}
        disabled={isDisabled}
        icon={<IconCozBroom className="text-18px" />}
        size="default"
        onClick={onClick}
        className={classNames('mr-12px', '!rounded-full', className)}
      />
    </UIKitTooltip>
  );
};

export default ClearHistoryButton;
