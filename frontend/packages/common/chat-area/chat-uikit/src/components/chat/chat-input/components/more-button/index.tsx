import { type ReactNode, type FC } from 'react';

import classNames from 'classnames';
import { IconCozPlusCircle } from '@coze/coze-design/icons';
import { IconButton } from '@coze/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { UIKitTooltip } from '../../../../common/tooltips';

interface IProps {
  isDisabled?: boolean;
  tooltipContent?: ReactNode;
  layout: Layout;
}

const MoreButton: FC<IProps> = props => {
  const { isDisabled, tooltipContent, layout } = props;

  return (
    <UIKitTooltip
      // 为了点调起选择文件的事件时收起 tooltip
      disableFocusListener
      content={tooltipContent}
      hideToolTip={layout === Layout.MOBILE}
    >
      <IconButton
        className="!rounded-full"
        data-testid="chat-area.chat-upload-button"
        color="secondary"
        disabled={isDisabled}
        icon={
          <IconCozPlusCircle
            className={classNames(
              isDisabled ? 'coz-fg-dim' : 'coz-fg-primary',
              'text-18px',
            )}
          />
        }
      />
    </UIKitTooltip>
  );
};

export default MoreButton;
