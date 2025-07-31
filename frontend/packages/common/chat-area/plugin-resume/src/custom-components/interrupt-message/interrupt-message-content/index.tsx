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

import classNames from 'classnames';
import {
  PluginName,
  useWriteablePlugin,
  type Message,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { Space } from '@coze-arch/bot-semi';

import { useGetPosition } from '../../../hooks/use-get-position';

import styles from './index.module.less';

export const InterruptMessageContent: React.FC<{
  interruptMessage: Message;
  actionText?: string;
  setActionText: (actionText: string) => void;
}> = ({ interruptMessage, actionText, setActionText }) => {
  const plugin = useWriteablePlugin<unknown>(PluginName.Resume);

  const { sendResumeMessage, stopResponding } =
    plugin.chatAreaPluginContext?.writeableAPI.message ?? {};

  // Get interrupt scene, continue chat id
  const toolCall =
    interruptMessage.required_action?.submit_tool_outputs?.tool_calls?.[0];

  const { loading, getSysPosition: handleAllowOnce } = useGetPosition({
    getPositionSuccess: position => {
      setActionText(
        I18n.t('chat_geolocation_auth_allow_tip', {
          plugin: toolCall?.require_info?.name ?? 'plugin',
        }),
      );
      sendResumeMessage?.({
        replyId: interruptMessage.reply_id,
        options: {
          extendFiled: {
            interrupt_message_id: interruptMessage.message_id,
            resume_message_id: interruptMessage.reply_id,
            tool_outputs: [
              {
                tool_call_id: toolCall?.id,
                output: JSON.stringify({
                  coordinates: {
                    longitude: String(position.coords.longitude),
                    latitude: String(position.coords.latitude),
                  },
                }),
              },
            ],
          },
        },
      });
    },
  });

  const handleReject = () => {
    setActionText(
      I18n.t('chat_geolocation_auth_decline_tip', {
        plugin: toolCall?.require_info?.name ?? 'plugin',
      }),
    );
    stopResponding?.();
  };

  return (
    <div className={classNames(styles['interrupt-message-box'])}>
      {actionText ? (
        <div className={classNames(styles['interrupt-message-action'])}>
          {actionText}
        </div>
      ) : (
        <div className={classNames(styles['interrupt-message-content'])}>
          {toolCall?.require_info?.require_fields?.includes('coordinates') ? (
            <>
              {I18n.t('chat_geolocation_auth_request_message', {
                plugin_name: toolCall?.require_info?.name ?? 'plugin',
              })}
              <Space
                className={classNames(styles['interrupt-message-content-btns'])}
              >
                <Button
                  color="highlight"
                  size="small"
                  loading={loading}
                  onClick={handleAllowOnce}
                >
                  {I18n.t('chat_geolocation_auth_request_message_allow_button')}
                </Button>
                <Button
                  color="primary"
                  size="small"
                  disabled={loading}
                  onClick={handleReject}
                >
                  {I18n.t(
                    'chat_geolocation_auth_request_message_decline_button',
                  )}
                </Button>
              </Space>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

InterruptMessageContent.displayName = 'ChatAreaFunctionCallMessageContent';
