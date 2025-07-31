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

import {
  forwardRef,
  useImperativeHandle,
  useState,
  type Dispatch,
  type ForwardRefExoticComponent,
  type PropsWithChildren,
  type PropsWithoutRef,
  type RefAttributes,
  type RefObject,
  type SetStateAction,
  useRef,
  useEffect,
} from 'react';

import Textarea, { type TextAreaRef } from 'rc-textarea';
import { merge } from 'lodash-es';
import classNames from 'classnames';
import { useControllableValue, useUpdateEffect } from 'ahooks';
import {
  IconCozKeyboard,
  IconCozMicrophone,
} from '@coze-arch/coze-design/icons';
import { Divider, IconButton } from '@coze-arch/coze-design';
import {
  type IChatInputProps,
  type InputMode,
  Layout,
} from '@coze-common/chat-uikit-shared';

import { AudioRecord } from '../audio-record';
import { UIKitTooltip } from '../../common';
import { useAudioRecordInteraction } from '../../../hooks/use-audio-record-interaction';
import { ChatUpload } from '../../../components/chat/chat-upload';
import { useTextSend } from './use-text-area';
import BuiltinSendButton from './components/send-button';
import MoreButton from './components/more-button';
import ClearHistoryButton from './components/clear-history-button';
import ClearContextButton from './components/clear-context-button';

import styles from './index.module.less';

const DEFAULT_HEIGHT = 24;

export interface UiKitChatInputButtonConfig {
  isSendButtonVisible: boolean;
  isClearHistoryButtonVisible: boolean;
  isMoreButtonVisible: boolean;
  isClearContextButtonVisible: boolean;
}

export type ChatInputTooltipComponent = ForwardRefExoticComponent<
  PropsWithoutRef<PropsWithChildren> &
    RefAttributes<{
      close: () => void;
    }>
>;

export interface InputRefObject {
  input: RefObject<TextAreaRef>;
  setValue: Dispatch<SetStateAction<string>>;
  sendMessage: IChatInputProps['onSendMessage'];
}

export const ChatInput = forwardRef<InputRefObject, IChatInputProps>(
  // eslint-disable-next-line complexity, @coze-arch/max-line-per-function, max-lines-per-function
  (props, ref) => {
    const {
      onBeforeSubmit,
      onFocus,
      onBlur,
      isReadonly,
      leftActions,
      rightActions,
      addonTop,
      addonLeft,
      aboveOutside,
      buildInButtonConfig,
      buildInButtonStatus,
      copywritingConfig,
      onSendMessage,
      onClearHistory,
      onClearContext,
      onUpload,
      onInputClick,
      hasOtherContentToSend,
      layout,
      isFileCountExceedsLimit,
      inputTooltip: InputTooltip,
      showBackground,
      limitFileCount,
      onPaste,
      CustomSendButton,
      isInputReadonly,
      inputNativeCallbacks,
      audioRecordEvents = {},
      audioRecordState = {},
      audioRecordOptions,
      className: _className,
      wrapperClassName,
      ...inputModeProps
    } = props;

    const {
      isSendButtonVisible = true,
      isClearHistoryButtonVisible = true,
      isMoreButtonVisible = true,
      isClearContextButtonVisible = false,
    } = buildInButtonConfig ?? {};

    const {
      isClearHistoryButtonDisabled,
      isMoreButtonDisabled,
      isSendButtonDisabled,
      isClearContextButtonDisabled,
    } = buildInButtonStatus ?? {};
    const { tooltip, inputPlaceholder, uploadConfig, bottomTips } =
      copywritingConfig ?? {};
    const {
      sendButtonTooltipContent,
      clearHistoryButtonTooltipContent,
      clearContextButtonTooltipContent,
      moreButtonTooltipContent,
      audioButtonTooltipContent,
      keyboardButtonTooltipContent,
    } = tooltip ?? {};
    const [isMultiLines, setIsMultiLines] = useState(false);
    const [breakLength, setBreakLength] = useState(0);
    const [isFocus, setIsFocus] = useState(false);
    const [mode, setMode] = useControllableValue<InputMode>(inputModeProps, {
      defaultValue: 'input',
      valuePropName: 'inputMode',
      trigger: 'onInputModeChange',
    });
    const audioButtonWrapperRef = useRef<HTMLDivElement>(null);

    useAudioRecordInteraction({
      target: audioButtonWrapperRef,
      events: audioRecordEvents,
      options: merge({}, audioRecordOptions, {
        enabled: mode === 'audio' && audioRecordOptions?.enabled,
      }),
    });

    const inputSizeRef = useRef<HTMLDivElement>(null);
    const [inputWidth, setInputWidth] = useState<'100%' | number>('100%');
    useEffect(() => {
      const target = inputSizeRef.current;
      if (!target) {
        return;
      }
      const observer = new ResizeObserver(() => {
        setInputWidth(target.clientWidth);
      });
      observer.observe(target);
      return () => {
        observer.disconnect();
      };
    }, []);

    const isInputMode = mode === 'input';
    const isAudioMode = mode === 'audio';

    const handleClickContextButtonClick = () => {
      onClearContext?.();
    };
    /**
     * Handle the Clear History button click event
     */
    const handleClearHistoryButtonClick = () => {
      onClearHistory?.();
    };

    /**
     * Handle user sending messages
     * @Param text The text of the message sent by the user
     */
    const handleSendMessage = (text: string) => {
      onSendMessage?.({
        text,
        mentionList: [],
      });
      setIsMultiLines(false);
      setBreakLength(0);
    };

    const {
      onChange,
      setIsComposing,
      onKeyDown,
      inputText,
      setInputText,
      submit: handleSendButtonClick,
      rcTextareaRef,
      updateSelectPos,
      onKeyUp,
    } = useTextSend({
      onSubmit: handleSendMessage,
      onBeforeSubmit,
      isDisabled: isSendButtonDisabled,
      allowEmpty: hasOtherContentToSend,
      inputNativeCallbacks,
    });
    const buttonClass = showBackground ? '!coz-fg-images-white' : '';

    const handleResize = ({ height }: { height: number }) => {
      if (
        !isMultiLines &&
        height > DEFAULT_HEIGHT &&
        // Judging by the length of inputText, excluding the resize caused by placeholder will not be processed.
        inputText?.trim()?.length !== 0
      ) {
        setIsMultiLines(true);
        setBreakLength(inputText.length);
      }
    };

    const handleOnChange = (evt: { target: { value: string } }) => {
      onChange(evt);
      if (isMultiLines && evt.target.value.length < breakLength) {
        setIsMultiLines(false);
      }
    };

    /** Calculate the readonly value of the compound condition */
    const finalClearHistoryButtonDisable =
      isClearHistoryButtonDisabled || isReadonly;
    const finalSendButtonDisable =
      (Boolean(!inputText?.trim()) && !hasOtherContentToSend) ||
      isSendButtonDisabled ||
      isReadonly;
    const finalMoreButtonDisable = isMoreButtonDisabled || isReadonly;
    const finalClearContextButtonDisable =
      isClearContextButtonDisabled || isReadonly;

    const getFinalSendButtonVisible = () => {
      const visibleCondition = isSendButtonVisible && isInputMode;
      if (audioRecordOptions?.enabled) {
        return visibleCondition && inputText;
      }
      return visibleCondition;
    };
    useUpdateEffect(() => {
      if (mode !== 'input') {
        return;
      }
      rcTextareaRef.current?.focus();
    }, [mode]);
    useImperativeHandle(ref, () => ({
      input: rcTextareaRef,
      setValue: setInputText,
      sendMessage: onSendMessage,
    }));

    const SendButton = CustomSendButton ?? BuiltinSendButton;

    return (
      <div className={styles['input-container']}>
        <div
          className={classNames(
            styles['input-wrap'],
            'py-0',
            layout === Layout.MOBILE ? 'px-[16px]' : 'px-[24px]',
            'input-wraper-for-reset',
          )}
        >
          {aboveOutside}
          <div
            className={classNames(
              styles['left-actions-container'],
              ['mb-8px'],
              typeof audioRecordState.isRecording === 'boolean' &&
                audioRecordState.isRecording
                ? [styles['animate-left'], '!w-0']
                : styles['animate-left-revert'],
            )}
          >
            {leftActions}
            {isClearContextButtonVisible ? (
              <ClearContextButton
                showBackground={Boolean(showBackground)}
                tooltipContent={clearContextButtonTooltipContent}
                isDisabled={finalClearContextButtonDisable}
                onClick={handleClickContextButtonClick}
                data-testid="bot-edit-debug-chat-clear-button"
                layout={layout}
                className={buttonClass}
              ></ClearContextButton>
            ) : null}
            {isClearHistoryButtonVisible ? (
              <ClearHistoryButton
                showBackground={Boolean(showBackground)}
                tooltipContent={clearHistoryButtonTooltipContent}
                isDisabled={finalClearHistoryButtonDisable}
                onClick={handleClearHistoryButtonClick}
                data-testid="bot-edit-debug-chat-clear-button"
                layout={layout}
                className={buttonClass}
              />
            ) : null}
          </div>
          <div
            ref={inputSizeRef}
            className="flex-[1] flex justify-end overflow-hidden"
          >
            <div
              style={{ width: inputWidth }}
              className={classNames(
                styles['textarea-with-top-rows'],
                ['coz-bg-max', 'coz-stroke-plus', 'relative'],
                isFocus && styles['input-focus'],
                (isFocus || audioRecordState.isRecording) && [
                  '!coz-stroke-hglt',
                ],
                audioRecordState.isRecording &&
                  audioRecordState.isPointerMoveOut &&
                  '!coz-stroke-hglt-red',
                audioRecordState.isRecording
                  ? 'overflow-visible'
                  : 'overflow-hidden',
                mode === 'audio' && 'cursor-pointer',
                (mode === 'audio' || audioRecordState.isRecording) &&
                  'hover:coz-stroke-hglt',
                showBackground && styles['background-theme'],
                { '!coz-bg-image-bots': showBackground },
                layout === Layout.MOBILE &&
                  audioRecordState.isRecording &&
                  (audioRecordState.isPointerMoveOut
                    ? styles['mobile-audio-bg-danger']
                    : styles['mobile-audio-bg']),
                wrapperClassName,
              )}
            >
              {addonTop}
              <div
                className={classNames(
                  styles['textarea-with-actions-container'],
                  styles['coz-textarea-with-actions-container-padding'],
                  'py-8px',
                  'pr-8px',
                  'pl-20px',
                  {
                    [styles['textarea-with-actions-container__row']]:
                      !isMultiLines,
                    [styles['textarea-with-actions-container__col']]:
                      isMultiLines,
                  },
                )}
              >
                {InputTooltip ? (
                  <InputTooltip>
                    <i className={styles['input-tooltip-anchor']} />
                  </InputTooltip>
                ) : null}
                {addonLeft}
                {isInputMode ? (
                  <Textarea
                    data-testid="bot.ide.chat_area.chat_input.textarea"
                    disabled={isInputReadonly || isReadonly}
                    className={classNames(
                      styles.textarea,
                      [
                        'coz-fg-primary',
                        'coz-bg-max',
                        'disabled:coz-bg-max',
                        'placeholder:coz-fg-dim',
                      ],
                      {
                        [styles['textarea--with-margin']]: isMultiLines,
                      },
                    )}
                    autoSize={{
                      minRows: 1,
                      maxRows: 5,
                    }}
                    classNames={{
                      textarea: classNames(
                        styles.textarea,
                        layout === Layout.MOBILE
                          ? 'text-[16px]'
                          : 'text-[14px]',
                      ),
                    }}
                    ref={rcTextareaRef}
                    placeholder={inputPlaceholder}
                    onChange={handleOnChange}
                    value={inputText}
                    onCompositionStart={evt => setIsComposing(evt, true)}
                    onCompositionEnd={evt => setIsComposing(evt, false)}
                    onKeyDown={onKeyDown}
                    onKeyUp={onKeyUp}
                    onResize={handleResize}
                    onSelect={updateSelectPos}
                    onClick={onInputClick}
                    onFocus={e => {
                      onFocus?.(e);
                      setIsFocus(true);
                    }}
                    onBlur={e => {
                      onBlur?.(e);
                      setIsFocus(false);
                    }}
                    onPaste={onPaste}
                  />
                ) : null}
                {isAudioMode ? (
                  <AudioRecord
                    ref={audioButtonWrapperRef}
                    {...audioRecordState}
                    layout={layout}
                  />
                ) : null}

                <div
                  className={classNames(
                    audioRecordState.isRecording
                      ? 'opacity-0 w-0'
                      : 'opacity-100',
                    styles['textarea-actions-container'],
                    styles['textarea-actions-container-transition'],
                  )}
                >
                  <div className={styles['textarea-actions-right']}>
                    {getFinalSendButtonVisible() ? (
                      <SendButton
                        tooltipContent={sendButtonTooltipContent}
                        isDisabled={finalSendButtonDisable}
                        onClick={handleSendButtonClick}
                        layout={layout}
                      />
                    ) : null}
                    {!inputText &&
                    !isAudioMode &&
                    audioRecordOptions?.enabled ? (
                      <UIKitTooltip
                        content={audioButtonTooltipContent}
                        hideToolTip={layout === Layout.MOBILE}
                      >
                        <IconButton
                          className="!rounded-full"
                          color="secondary"
                          icon={<IconCozMicrophone className="text-18px" />}
                          onClick={() => {
                            setMode('audio');
                          }}
                        />
                      </UIKitTooltip>
                    ) : null}
                    {isAudioMode ? (
                      <UIKitTooltip
                        content={keyboardButtonTooltipContent}
                        hideToolTip={layout === Layout.MOBILE}
                      >
                        <IconButton
                          className="!rounded-full"
                          color="secondary"
                          icon={<IconCozKeyboard className="text-18px" />}
                          onClick={() => {
                            setMode('input');
                          }}
                        />
                      </UIKitTooltip>
                    ) : null}
                  </div>
                  {rightActions || isMoreButtonVisible ? (
                    <>
                      <Divider layout="vertical" style={{ height: '14px' }} />
                      <div className={styles['textarea-actions-left']}>
                        {rightActions}
                        {isMoreButtonVisible ? (
                          <ChatUpload
                            onUpload={(uploadType, file) =>
                              onUpload?.(uploadType, { file, mentionList: [] })
                            }
                            isFileCountExceedsLimit={isFileCountExceedsLimit}
                            copywritingConfig={uploadConfig}
                            isDisabled={finalMoreButtonDisable}
                            limitFileCount={limitFileCount}
                          >
                            <MoreButton
                              tooltipContent={moreButtonTooltipContent}
                              isDisabled={finalMoreButtonDisable}
                              layout={layout}
                            />
                          </ChatUpload>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        {bottomTips ? (
          <div
            className={classNames(
              styles['bottom-tips'],
              'coz-fg-dim',
              showBackground && '!coz-fg-images-secondary',
            )}
          >
            <span>{bottomTips}</span>
          </div>
        ) : null}
      </div>
    );
  },
);

ChatInput.displayName = 'UiKitChatInput';
