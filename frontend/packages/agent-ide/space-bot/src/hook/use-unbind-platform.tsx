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

import { useRequest } from 'ahooks';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { SpaceApi } from '@coze-arch/bot-space-api';
import { useUIModal, Typography } from '@coze-arch/bot-semi';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import { IconAlertTriangle } from '@douyinfe/semi-icons';

import styles from '../pages/publish/index.module.less';

interface DiscordConfigureProps {
  botId: string;
  origin?: 'project' | 'bot';
  platformInfo: PublishConnectorInfo;
  onUnbind: () => void;
}

const unbindPublishPlatformEvent = createReportEvent({
  eventName: ReportEventNames.unbindPublishPlatform,
});

export const useUnbindPlatformModal = ({
  botId,
  origin = 'bot',
  platformInfo,
  onUnbind,
}: DiscordConfigureProps) => {
  const { loading, run: unbindConntect } = useRequest(
    async () => {
      await SpaceApi.UnBindConnector({
        bot_id: botId,
        agent_type: origin === 'bot' ? 0 : 1,
        bind_id: platformInfo.bind_id ?? '',
        connector_id: platformInfo.id,
      });
    },
    {
      manual: true,
      onBefore: () => {
        unbindPublishPlatformEvent.start();
      },
      onSuccess: () => {
        onUnbind();
        close();
        unbindPublishPlatformEvent.success();
      },
      onError: (error, params) => {
        unbindPublishPlatformEvent.error({
          error,
          reason: error?.message,
          meta: { ...params },
        });
      },
    },
  );

  const { modal, open, close } = useUIModal({
    type: 'info',
    icon: (
      <IconAlertTriangle
        style={{ color: 'var(--semi-color-danger)' }}
        size="extra-large"
      />
    ),
    onOk: () => {
      unbindConntect();
    },
    okText: I18n.t('Confirm'),
    okButtonProps: {
      loading,
      type: 'danger',
    },
    cancelText: I18n.t('Cancel'),
    onCancel: () => close(),
    title: I18n.t('bot_publish_disconnect_title', {
      platform: platformInfo?.name ?? '',
    }),
    closable: false,
  });

  return {
    node: modal(
      <Typography.Paragraph className={styles['unbind-text']}>
        {I18n.t('bot_publish_disconnect_desc', {
          platform: platformInfo?.name ?? '',
        })}
      </Typography.Paragraph>,
    ),
    open,
    close,
  };
};
