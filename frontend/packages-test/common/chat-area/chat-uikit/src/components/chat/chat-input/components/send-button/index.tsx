import { type FC } from 'react';

import classNames from 'classnames';
import { IconCozSendFill } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';
import { Layout, type SendButtonProps } from '@coze-common/chat-uikit-shared';

import { UIKitTooltip } from '../../../../common/tooltips';

const SendButton: FC<SendButtonProps> = props => {
  const { isDisabled, tooltipContent, onClick, layout } = props;
  return (
    <UIKitTooltip
      content={tooltipContent}
      hideToolTip={layout === Layout.MOBILE}
    >
      <IconButton
        className={classNames('!rounded-full', !isDisabled && '!coz-fg-hglt')}
        disabled={isDisabled}
        data-testid="bot-home-chart-send-button"
        size="default"
        color="secondary"
        icon={<IconCozSendFill className="text-18px" />}
        onClick={onClick}
      />
    </UIKitTooltip>
  );
};

export default SendButton;
