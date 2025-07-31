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

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useCountDown } from 'ahooks';
import { AudioStaticToast, StopRespondButton } from '@coze-common/chat-uikit';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDownward } from '@coze-arch/coze-design/icons';

import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useStopResponding } from '../../hooks/messages/use-stop-responding';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

export const AbsoluteRow: React.FC = () => {
  const { useWaitingStore, useAudioUIStore } = useChatAreaStoreSet();
  const { showStopRespond } = usePreference();

  const waiting = useWaitingStore(state => state.waiting);
  const { stopRespondOverrideWaiting } = usePreference();
  const finalWaiting = stopRespondOverrideWaiting ?? waiting;
  const {
    isRecording,
    isPointerMoveOut,
    isRecordingPointerOut,
    audioLeftTime,
    recordingInteractionType,
  } = useAudioUIStore(
    useShallow(state => ({
      isRecording: state.isRecording,
      isPointerMoveOut: state.isPointerMoveOut,
      isRecordingPointerOut: state.isRecording && state.isPointerMoveOut,
      audioLeftTime: state.audioLeftTime,
      recordingInteractionType: state.recordingInteractionType,
    })),
  );

  const [audioCountDown] = useCountDown({
    leftTime: typeof audioLeftTime === 'number' ? audioLeftTime : undefined,
  });
  const onStopRes = useStopResponding();
  const showBackground = useShowBackGround();

  if ((!finalWaiting || !showStopRespond) && !isRecording) {
    return null;
  }

  return (
    <div className={classNames(styles['absolute-row'])}>
      {showStopRespond && finalWaiting ? (
        <StopRespondButton
          content={I18n.t('coze_home_stop_btn')}
          onClick={onStopRes}
          className={classNames(
            showBackground
              ? '!coz-bg-image-bots !coz-stroke-image-bots'
              : [
                  styles.bg,
                  'coz-shadow-default',
                  '!coz-stroke-primary',
                  '!border-[1px]',
                  'border-solid',
                ],
          )}
        />
      ) : null}
      {isRecording ? (
        <div className="relative w-full h-40px">
          <div
            className={classNames(
              'absolute w-full flex items-center justify-center',
              styles['danger-mask-transition'],
              isPointerMoveOut ? 'opacity-100' : 'opacity-0',
            )}
          >
            <AudioStaticToast
              theme={showBackground ? 'background' : 'danger'}
              color="danger"
              className="flex items-center gap-x-6px"
            >
              <IconCozArrowDownward className="text-xxl" />
              <div className="leading-[20px] text-lg font-medium">
                {I18n.t('chat_voice_input_speaking_cancel_send')}
              </div>
            </AudioStaticToast>
          </div>
          {!isPointerMoveOut ? (
            <div
              className={classNames(
                'absolute w-full flex items-center justify-center',
              )}
            >
              <AudioStaticToast
                theme={showBackground ? 'background' : 'primary'}
              >
                {audioLeftTime ? (
                  <div className="flex items-center gap-x-6px">
                    <span className="coz-fg-hglt text-xxl leading-[22px] font-medium">
                      {Math.round(audioCountDown / 1000)}˝
                    </span>
                    <span className="coz-fg-primary text-lg leading-[20px] font-normal">
                      {I18n.t(
                        'chat_voice_input_tip_speaking_record_and_send_after_x_seconds',
                      )}
                    </span>
                  </div>
                ) : null}
                {!isRecordingPointerOut &&
                  !audioLeftTime &&
                  (recordingInteractionType === 'clickOrTouch' ? (
                    <div className="coz-fg-primary leading-[20px] text-lg font-normal">
                      {I18n.t('chat_voice_input_tip_speaking_cancel_and_send')}
                    </div>
                  ) : (
                    <div className="coz-fg-primary leading-[20px] text-lg font-normal">
                      {I18n.t(
                        'chat_voice_input_tip_speaking_cancel_and_send_when_hold_down_space',
                      )}
                    </div>
                  ))}
              </AudioStaticToast>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

AbsoluteRow.displayName = 'ChatAreaAbsoluteRow';
