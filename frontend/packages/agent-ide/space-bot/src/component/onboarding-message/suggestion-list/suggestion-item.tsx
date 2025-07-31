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
  type ForwardedRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import classNames from 'classnames';
import { type ConnectDnd } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { emitEvent, OpenBlockEvent } from '@coze-arch/bot-utils';
import { TextArea, UIIconButton } from '@coze-arch/bot-semi';
import {
  type ExtendOnboardingContent,
  type SuggestQuestionMessage,
  useBotDetailIsReadonly,
} from '@coze-studio/bot-detail-store';
import { IconShortcutTrash } from '@coze-arch/bot-icons';
import { botInputLengthService } from '@coze-agent-ide/bot-input-length-limit';
import { IconCozHandle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import s from '../index.module.less';
import { settingAreaScrollId } from '../const';
import commonStyles from '../../../assets/styles/index.module.less';

const highlightTime = 5000;

interface SGRef {
  triggerFocus?: () => void;
}

export const SuggestQuestionItemContent: React.FC<{
  message: SuggestQuestionMessage;
  onRef?: ForwardedRef<SGRef>;
  connect: ConnectDnd;
  isDragging: boolean;
  isHovered: boolean;
  onMessageChange: (changes: SuggestQuestionMessage) => void;
  value: ExtendOnboardingContent['suggested_questions'];
  handleRemoveSuggestion: (id) => void;
  handleOnBlur?: () => void;
  disabled?: boolean;
}> = ({
  message,
  onRef,
  onMessageChange,
  value,
  handleRemoveSuggestion,
  handleOnBlur,
  connect,
  isDragging,
  disabled,
}) => {
  useImperativeHandle(onRef, () => ({
    triggerFocus,
  }));

  const isReadonly = useBotDetailIsReadonly();

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const dropRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  connect(dropRef, dragRef);
  useEffect(() => {
    connect(dropRef, dragRef);
  }, [dragRef, dropRef]);

  const triggerFocus = () => {
    textAreaRef?.current?.focus();
  };

  useEffect(() => {
    if (message.highlight) {
      // Bot Details - User Timed Tasks - Add Bootstrap to Opener - Need to Expand Opener Module
      emitEvent(OpenBlockEvent.ONBORDING_MESSAGE_BLOCK_OPEN);
      // animation effect
      const duration = 250;
      setTimeout(() => {
        const settingAreaScrollElement =
          document.getElementById(settingAreaScrollId);
        if (settingAreaScrollElement) {
          settingAreaScrollElement.scrollTo({
            left: 0,
            top: settingAreaScrollElement.scrollHeight,
            behavior: 'smooth',
          });
        }
        // Folded area unfolded 250ms animation time
      }, duration);

      setTimeout(() => {
        onMessageChange({ ...message, highlight: false });
      }, highlightTime);
    }
  }, []);

  if (isReadonly) {
    return (
      <div
        className={classNames(
          s['text-readonly'],
          s['mb-8'],
          !message.content && s['text-none'],
        )}
      >
        {message.content || I18n.t('bot_element_unset')}
      </div>
    );
  }

  const removeItems = () => {
    handleRemoveSuggestion(message.id);
  };

  const handleBlur = () => {
    const lastItemId = value?.[value?.length - 1]?.id || null;

    if (lastItemId !== message.id && !message.content) {
      removeItems();
    }
    handleOnBlur?.();
  };

  return (
    <div
      date-testid="bot-editor.suggestion-list-setting.suggestion-message-item"
      className={s['suggestion-message-item']}
      ref={dropRef}
    >
      <div ref={!disabled ? dragRef : null}>
        <IconCozHandle
          className={classNames('mr-1 cursor-grab text-[#0607094D]', {
            'cursor-grabbing': isDragging,
          })}
        />
      </div>
      <TextArea
        autosize
        rows={1}
        ref={textAreaRef}
        className={classNames(
          s['suggest-message-input'],
          message.highlight && s['suggestion-item-highlight'],
        )}
        placeholder={I18n.t('opening_question_placeholder')}
        value={message.content}
        onChange={v => {
          onMessageChange({ ...message, content: v });
        }}
        onBlur={handleBlur}
        maxLength={botInputLengthService.getInputLengthLimit(
          'onboardingSuggestion',
        )}
        getValueLength={botInputLengthService.getValueLength}
      />
      <Tooltip content={I18n.t('bot_edit_plugin_delete_tooltip')}>
        <UIIconButton
          wrapperClass={classNames(
            commonStyles['icon-button-16'],
            s['apis-no-icon'],
          )}
          iconSize="small"
          icon={
            <IconShortcutTrash
              style={message.content ? {} : { color: 'rgba(29, 28, 35, 0.20)' }}
            />
          }
          onClick={() => {
            if (!message.content) {
              return;
            }
            removeItems();
          }}
        />
      </Tooltip>
    </div>
  );
};
