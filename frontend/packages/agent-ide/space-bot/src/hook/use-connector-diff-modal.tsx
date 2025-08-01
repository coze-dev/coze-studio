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

import { useState } from 'react';

import { useRequest } from 'ahooks';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { Spin, useUIModal } from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';
import { Branch } from '@coze-arch/bot-api/dp_manage_api';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import { dpManageApi } from '@coze-arch/bot-api';
import { useParams } from 'react-router-dom';

import styles from '../pages/publish/index.module.less';
import { NewBotDiffView } from '../component/bot-diff-view/new-diff-view';
import { BotDiffView } from '../component/bot-diff-view';
const getBotPublishDiffReportEvent = createReportEvent({
  eventName: ReportEventNames.getBotDiffError,
});

export const useConnectorDiffModal = () => {
  const [selectedRecord, setSelectedRecord] = useState<PublishConnectorInfo>();
  const params = useParams<DynamicParams>();
  const [Flags] = useFlags();
  const isUseNewTemplate = !!Flags?.['bot.devops.merge_prompt_diff'];
  const {
    data: botDiffData,
    loading,
    run,
    mutate,
    error: requestError,
  } = useRequest(
    async (record: PublishConnectorInfo) => {
      const { bot_id = '', space_id = '', commit_version } = params;
      const result = await dpManageApi.BotDiff({
        space_id,
        bot_id,
        left: {
          branch: Branch.Publish,
          connector_id: record.id,
        },
        template_key: isUseNewTemplate ? 'diff_template_when_publish_v2' : '',
        right: { branch: Branch.Base, version_id: commit_version },
      });
      return result.data;
    },
    {
      manual: true,
      onBefore: () => {
        getBotPublishDiffReportEvent.start();
      },
      onSuccess: data => {
        getBotPublishDiffReportEvent.success();
      },
      onError: error => {
        getBotPublishDiffReportEvent.error({
          reason: 'get publish diff error',
          error,
        });
      },
    },
  );
  const closeModal = () => {
    mutate({ origin_bot_dl: '', diff_display_node: [] });
    close();
  };
  const openModal = (record: PublishConnectorInfo) => {
    setSelectedRecord(record);
    run(record);
    open();
  };
  const { modal, open, close } = useUIModal({
    type: 'info',
    okText: I18n.t('devops_publish_multibranch_done'),
    okType: 'tertiary',
    okButtonProps: { className: 'semi-button-light' },
    hasCancel: false,

    className: styles['diff-modal'],
    onCancel: closeModal,
    onOk: closeModal,
    title: I18n.t('devops_publish_multibranch_diffwithin', {
      connectorName: selectedRecord?.name ?? '',
    }),
  });

  return {
    node: modal(
      <div className={styles['diff-modal-container']}>
        {loading ? (
          <Spin />
        ) : isUseNewTemplate ? (
          <NewBotDiffView
            diffData={botDiffData?.diff_display_node || []}
            hasError={requestError !== undefined}
            type={'publish'}
          />
        ) : (
          <BotDiffView
            diffData={botDiffData?.diff_display_node || []}
            hasError={requestError !== undefined}
          />
        )}
      </div>,
    ),
    open: openModal,
    close,
  };
};
