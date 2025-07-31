/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef } from 'react';

import { useHover } from 'ahooks';
import { MessageFeedbackType } from '@coze-common/chat-core';
import {
  useChatAreaLayout,
  useLatestSectionId,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozThumbsup,
  IconCozThumbsupFill,
} from '@coze-arch/coze-design/icons';
import { Tooltip, IconButton } from '@coze-arch/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { getShowFeedback } from '../../utils/get-show-feedback';
import { useReportMessageFeedback } from '../../hooks/use-report-message-feedback';
import { useDispatchMouseLeave } from '../../hooks/use-dispatch-mouse-leave';

export interface ThumbsUpProps {
  isThumbsUpSuccessful?: boolean;
  onClick?: () => void;
  isFrownUponPanelVisible: boolean;
}

export interface ThumbsUpUIProps extends ThumbsUpProps {
  isMobile: boolean;
}

export const ThumbsUp: React.FC<ThumbsUpProps> = ({
  isThumbsUpSuccessful = false,
  onClick,
  isFrownUponPanelVisible,
}) => {
  const layout = useChatAreaLayout();
  const isMobileLayout = layout === Layout.MOBILE;
  const reportMessageFeedback = useReportMessageFeedback();

  const { message, meta } = useMessageBoxContext();
  const latestSectionId = useLatestSectionId();

  const handleClick = () => {
    reportMessageFeedback({
      message_feedback: {
        feedback_type: isThumbsUpSuccessful
          ? MessageFeedbackType.Default
          : MessageFeedbackType.Like,
      },
    }).then(() => {
      // Switch the display state after the interface is called.
      onClick?.();
    });
  };

  if (!getShowFeedback({ message, meta, latestSectionId })) {
    return null;
  }
  return (
    <ThumbsUpUI
      isMobile={isMobileLayout}
      onClick={handleClick}
      isThumbsUpSuccessful={isThumbsUpSuccessful}
      isFrownUponPanelVisible={isFrownUponPanelVisible}
    />
  );
};

export const ThumbsUpUI: React.FC<ThumbsUpUIProps> = ({
  onClick,
  isFrownUponPanelVisible,
  isMobile,
  isThumbsUpSuccessful,
}) => {
  const toolTipWrapperRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(toolTipWrapperRef);
  useDispatchMouseLeave(toolTipWrapperRef, isFrownUponPanelVisible);

  return (
    <div ref={toolTipWrapperRef}>
      <Tooltip
        trigger="custom"
        visible={!isMobile && isHovering}
        content={I18n.t('like')}
      >
        <IconButton
          data-testid="chat-area.answer-action.thumb-up-button"
          size="small"
          icon={
            isThumbsUpSuccessful ? (
              <IconCozThumbsupFill className="w-[14px] h-[14px] coz-fg-color-brand" />
            ) : (
              <IconCozThumbsup className="w-[14px] h-[14px]" />
            )
          }
          color="secondary"
          onClick={onClick}
        />
      </Tooltip>
    </div>
  );
};
