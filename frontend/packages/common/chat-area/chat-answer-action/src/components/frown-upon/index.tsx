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

import React, {
  type CSSProperties,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import classNames from 'classnames';
import { useHover } from 'ahooks';
import {
  MessageFeedbackDetailType,
  MessageFeedbackType,
} from '@coze-common/chat-core';
import {
  useChatAreaLayout,
  useLatestSectionId,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozThumbdown,
  IconCozThumbdownFill,
  IconCozCross,
} from '@coze-arch/coze-design/icons';
import { TextArea, Tooltip, Button, IconButton } from '@coze-arch/coze-design';
import { Layout } from '@coze-common/chat-uikit-shared';

import { getShowFeedback } from '../../utils/get-show-feedback';
import { useReportMessageFeedback } from '../../hooks/use-report-message-feedback';
import { useDispatchMouseLeave } from '../../hooks/use-dispatch-mouse-leave';

import s from './index.module.less';

export interface FrownUponProps {
  onClick?: () => void;
  isFrownUponPanelVisible: boolean;
  isFrownUponSuccessful: boolean;
}

export interface FrownUponUIProps extends FrownUponProps {
  isMobile: boolean;
}

// Click the button
export const FrownUpon: React.FC<PropsWithChildren<FrownUponProps>> = ({
  onClick,
  isFrownUponPanelVisible,
  isFrownUponSuccessful,
}) => {
  const layout = useChatAreaLayout();
  const isMobileLayout = layout === Layout.MOBILE;
  const reportMessageFeedback = useReportMessageFeedback();

  const { message, meta } = useMessageBoxContext();
  const latestSectionId = useLatestSectionId();

  const handleClick = () => {
    reportMessageFeedback({
      message_feedback: {
        feedback_type: isFrownUponSuccessful
          ? MessageFeedbackType.Default
          : MessageFeedbackType.Unlike,
        detail_types: isFrownUponSuccessful
          ? []
          : [MessageFeedbackDetailType.UnlikeDefault],
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
    <FrownUponUI
      onClick={handleClick}
      isMobile={isMobileLayout}
      isFrownUponPanelVisible={isFrownUponPanelVisible}
      isFrownUponSuccessful={isFrownUponSuccessful}
    />
  );
};

export const FrownUponUI: React.FC<FrownUponUIProps> = ({
  onClick,
  isFrownUponPanelVisible,
  isFrownUponSuccessful,
  isMobile,
}) => {
  const toolTipWrapperRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(toolTipWrapperRef);
  // Solve the problem that the tooltip display of the click button is disordered during the process of clicking and filling in the reason panel.
  useDispatchMouseLeave(toolTipWrapperRef, isFrownUponPanelVisible);
  return (
    <div style={{ position: 'relative' }} ref={toolTipWrapperRef}>
      <Tooltip
        content={I18n.t('dislike')}
        getPopupContainer={() => toolTipWrapperRef.current ?? document.body}
        trigger="custom"
        visible={!isMobile && isHovering}
      >
        <IconButton
          data-testid="chat-area.answer-action.frown-upon-buton"
          size="small"
          icon={
            isFrownUponSuccessful ? (
              <IconCozThumbdownFill className="w-[14px] h-[14px]" />
            ) : (
              <IconCozThumbdown className="w-[14px] h-[14px]" />
            )
          }
          color="secondary"
          onClick={onClick}
        />
      </Tooltip>
    </div>
  );
};

const getFrownUponPanelReasons = () => [
  {
    label: I18n.t('dislike_feedback_tag_harm'),
    value: MessageFeedbackDetailType.UnlikeHarmful,
  },
  {
    label: I18n.t('dislike_feedback_tag_mislead'),
    value: MessageFeedbackDetailType.UnlikeIncorrect,
  },
  {
    label: I18n.t('dislike_feedback_tag_unfollow_instruction'),
    value: MessageFeedbackDetailType.UnlikeNotFollowInstructions,
  },
  {
    label: I18n.t('dislike_feedback_tag_unfollow_others'),
    value: MessageFeedbackDetailType.UnlikeOthers,
  },
];

export interface FrownUponPanelProps {
  containerStyle?: CSSProperties;
  onCancel?: () => void;
  onSubmit?: () => void;
  wrapReasons?: boolean;
}

export interface OnFrownUponSubmitParam {
  reasons: Array<MessageFeedbackDetailType>;
  detailContent: string;
}
export interface FrownUponPanelUIProps {
  onSubmit: (param: OnFrownUponSubmitParam) => void;
  onCancel: (() => void) | undefined;
  wrapReasons: boolean | undefined;
  style?: CSSProperties;
}
// Click to fill in the reason panel
export const FrownUponPanel: React.FC<
  PropsWithChildren<FrownUponPanelProps>
> = ({ containerStyle, onCancel, onSubmit, wrapReasons }) => {
  const reportMessageFeedback = useReportMessageFeedback();

  const handleSubmit = ({ reasons, detailContent }: OnFrownUponSubmitParam) => {
    reportMessageFeedback({
      message_feedback: {
        feedback_type: MessageFeedbackType.Unlike,
        detail_types:
          reasons.length > 0
            ? reasons
            : [MessageFeedbackDetailType.UnlikeDefault],
        detail_content: reasons.includes(MessageFeedbackDetailType.UnlikeOthers)
          ? detailContent
          : undefined,
      },
    }).then(() => {
      // Switch the display state after the interface is called.
      onSubmit?.();
    });
  };

  return (
    <FrownUponPanelUI
      wrapReasons={wrapReasons}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      style={containerStyle}
    />
  );
};

export const FrownUponPanelUI: React.FC<FrownUponPanelUIProps> = ({
  onSubmit,
  onCancel,
  style,
  wrapReasons,
}) => {
  const [reasons, setReasons] = useState<Array<MessageFeedbackDetailType>>([]);

  const [textAreaValue, setTextAreaValue] = useState<string>('');

  const handleItemClick = (reason: MessageFeedbackDetailType) => {
    setReasons(prev => {
      if (prev.includes(reason)) {
        return prev.filter(item => item !== reason);
      }
      return [...prev, reason];
    });
  };

  return (
    <div
      className={classNames(s['frown-upon-container'], [
        'bg-[var(--coz-mg-card)]',
        'rounded-normal',
      ])}
      style={style}
    >
      <div className={s.header}>
        <div className={s.title}>{I18n.t('dislike_feedback_title')}</div>
        <IconButton
          size="small"
          color="secondary"
          icon={<IconCozCross />}
          onClick={onCancel}
        />
      </div>
      <div className={classNames(s.reasons, wrapReasons && 'flex-wrap')}>
        {getFrownUponPanelReasons().map(item => (
          <span
            className={classNames(s.item, {
              [`${s.selected}`]: reasons.includes(item.value),
            })}
            onClick={() => {
              handleItemClick(item.value);
            }}
          >
            {item.label}
          </span>
        ))}
      </div>
      <div className={s.textarea}>
        {reasons.includes(MessageFeedbackDetailType.UnlikeOthers) && (
          <TextArea
            placeholder={I18n.t('dislike_feedback_placeholder')}
            maxCount={500}
            showClear
            rows={2}
            value={textAreaValue}
            onChange={v => {
              setTextAreaValue(v);
            }}
          />
        )}
      </div>
      <div className={s.footer}>
        <Button
          theme="solid"
          onClick={() => onSubmit({ reasons, detailContent: textAreaValue })}
        >
          {I18n.t('feedback_submit')}
        </Button>
      </div>
    </div>
  );
};
