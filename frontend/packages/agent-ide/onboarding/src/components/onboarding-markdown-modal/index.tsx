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

import { useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useDebounce } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { Tag, Tooltip, UIModal, type UIModalProps } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';
import { type BotEditorOnboardingSuggestion } from '@coze-agent-ide/bot-editor-context-store';

import {
  OnboardingPreview,
  type OnboardingPreviewProps,
} from '../onboarding-preview';
import { MarkdownEditor, type MarkdownEditorProps } from '../markdown-editor';
import { ReactComponent as IconMinimizeOutlined } from '../../assets/icon_minimize_outlined.svg';
import { ONBOARDING_PREVIEW_DELAY } from './constant';
import {
  OnboardingSuggestionContent,
  type OnboardingSuggestionContentProps,
} from './components/onboarding-suggestion-content';
import { MarkdownDescriptionPopover } from './components/markdown-description-popover';

import styles from './index.module.less';

export interface OnboardingMarkdownModalProps
  extends UIModalProps,
    OnboardingSuggestionContentProps,
    Pick<
      MarkdownEditorProps,
      'getValueLength' | 'maxLength' | 'getSlicedTextOnExceed'
    > {
  getBotInfo: OnboardingPreviewProps['getBotInfo'];
  getUserInfo: () => {
    userName: string;
    userId: string;
  };
  prologue: string;
  onPrologueChange: (prologue: string) => void;
  /**
   * What you want to preview and what you can edit may be different.
   */
  previewSuggestions?: BotEditorOnboardingSuggestion[];
}

export const OnboardingMarkdownModal: React.FC<
  OnboardingMarkdownModalProps
> = ({
  getBotInfo,
  getUserInfo,
  onDeleteSuggestion,
  onPrologueChange,
  onSuggestionChange,
  onboardingSuggestions,
  previewSuggestions = onboardingSuggestions,
  prologue,
  getValueLength,
  maxLength,
  getSlicedTextOnExceed,
  ...modalProps
}) => {
  const [visible, setVisible] = useState(false);
  const [previewScrollable, setScrollable] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const onShowPopover = () => setVisible(true);
  const debouncedPrologue = useDebounce(prologue, {
    wait: ONBOARDING_PREVIEW_DELAY,
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const { scrollHeight, clientHeight } = ref.current;

    setScrollable(scrollHeight > clientHeight);
  }, [debouncedPrologue, onboardingSuggestions, modalProps.visible]);

  return (
    <UIModal
      {...modalProps}
      title={I18n.t('bot_preview_opening_remarks')}
      centered
      footer={null}
      type="base-composition"
      className={styles.modal}
      closeIcon={
        <Tooltip content={I18n.t('collapse')}>
          <span className={styles['modal-icon']}>
            <IconMinimizeOutlined className={styles['modal-icon']} />
          </span>
        </Tooltip>
      }
    >
      <div className={styles['onboarding-markdown']}>
        <div className={styles['edit-content']}>
          <div className={styles['opening-text']}>
            <div className={styles['strong-text']}>
              {I18n.t('bot_edit_opening_text_title')}
            </div>
            <MarkdownDescriptionPopover
              visible={visible}
              onVisibleChange={setVisible}
            >
              <Tag
                onClick={onShowPopover}
                className={styles['markdown-tag']}
                color="indigo"
              >
                <IconInfo style={{ marginRight: 4 }} />
                {I18n.t('markdown_is_supported')}
              </Tag>
            </MarkdownDescriptionPopover>
          </div>

          <MarkdownEditor
            className={styles['markdown-editor']}
            getUserId={() => getUserInfo().userId}
            value={prologue}
            onChange={onPrologueChange}
            getValueLength={getValueLength}
            maxLength={maxLength}
            getSlicedTextOnExceed={getSlicedTextOnExceed}
          />
          <div
            className={classNames(
              styles['opening-question'],
              styles['strong-text'],
            )}
          >
            {I18n.t('bot_edit_opening_question_title')}
            <Tooltip content={I18n.t('bot_edit_opening_questions_tooltip')}>
              <IconInfo />
            </Tooltip>
          </div>
          <OnboardingSuggestionContent
            onDeleteSuggestion={onDeleteSuggestion}
            onSuggestionChange={onSuggestionChange}
            onboardingSuggestions={onboardingSuggestions}
          />
        </div>
        <div
          className={classNames(
            styles['preview-content'],
            previewScrollable && styles['preview-content-scroll'],
          )}
          ref={ref}
        >
          <OnboardingPreview
            content={debouncedPrologue}
            suggestions={previewSuggestions}
            getBotInfo={getBotInfo}
            getUserName={() => getUserInfo().userName}
          />
        </div>
      </div>
    </UIModal>
  );
};
