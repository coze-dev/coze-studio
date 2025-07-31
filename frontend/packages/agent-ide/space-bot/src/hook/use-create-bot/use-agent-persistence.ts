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

/* eslint-disable complexity */

import { useState } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useCollaborationStore } from '@coze-studio/bot-detail-store/collaboration';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { updateBotRequest } from '@coze-studio/bot-detail-store';
import {
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import {
  type BotSpace,
  SpaceType,
  type DraftBotCreateResponse,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { type AgentInfoFormValue } from './agent-info-form';

type OnSuccessCallback = (
  botId?: string,
  spaceId?: string,
  extra?: { botName?: string; botAvatar?: string; botDesc?: string },
) => void | Promise<void>;

export interface UseAgentPersistenceProps {
  mode: 'add' | 'update';
  botId?: string; // Current bot ID for update mode
  currentSpaceId?: string; // Current space ID from store
  outerSpaceId?: string; // Space ID passed via props
  getValues: () => Promise<AgentInfoFormValue | undefined>;
  onSuccess?: OnSuccessCallback;
  onError?: () => void;
  onBefore?: () => void;
  setVisible: (visible: boolean) => void;
  setCheckErr: (isError: boolean) => void;
  setErrMsg: (message: string) => void;
  bizCreateFrom?: 'navi' | 'space';
  showSpace?: boolean;
}

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function
export const useAgentPersistence = ({
  mode,
  botId,
  currentSpaceId,
  outerSpaceId,
  getValues,
  onSuccess,
  onError,
  onBefore,
  setVisible,
  setCheckErr,
  setErrMsg,
  bizCreateFrom,
  showSpace,
}: UseAgentPersistenceProps) => {
  const [loading, setLoading] = useState(false);

  const setBotInfoByImmer = useBotInfoStore(state => state.setBotInfoByImmer);
  const setCollaborationByImmer = useCollaborationStore(
    state => state.setCollaborationByImmer,
  );
  const setPageRuntimeByImmer = usePageRuntimeStore(
    state => state.setPageRuntimeByImmer,
  );
  const {
    spaces: { bot_space_list: list },
  } = useSpaceStore();

  const reportEvent = createReportEvent({
    eventName:
      mode === 'add' ? ReportEventNames.createBot : ReportEventNames.updateBot,
  });

  const reportTea = ({
    resp,
    values,
    personalSpaceInfo,
    paramsSpaceId,
  }: {
    resp: DraftBotCreateResponse;
    values: AgentInfoFormValue | undefined;
    personalSpaceInfo: BotSpace | undefined;
    paramsSpaceId: string;
  }) => {
    if (resp.code === 0) {
      sendTeaEvent(EVENT_NAMES.create_bot_result, {
        source: showSpace ? 'menu_bar' : 'bot_list',
        workspace_type:
          personalSpaceInfo?.id === paramsSpaceId
            ? 'personal_workspace'
            : 'team_workspace',
        result: 'success',
        bot_name: values?.name || '',
        bot_desc: values?.target || '',
      });
    } else {
      sendTeaEvent(EVENT_NAMES.create_bot_result, {
        source: showSpace ? 'menu_bar' : 'bot_list',
        workspace_type:
          personalSpaceInfo?.id === paramsSpaceId
            ? 'personal_workspace'
            : 'team_workspace',
        result: 'failed',
        error_code: resp.code,
        error_message: resp.msg,
        bot_name: values?.name || '',
        bot_desc: values?.target || '',
      });
    }
  };

  const handleUpdateBot = async () => {
    if (!botId) {
      const msg = I18n.t('bot_copy_id_error');
      throw new CustomError(ReportEventNames.updateBot, msg);
    }
    const values = await getValues();
    logger.info({ message: 'update values', meta: { values } });

    try {
      setLoading(true);
      const botBaseInfo = {
        icon_uri: values?.bot_uri?.[0].uid || '',
        name: values?.name,
        description: values?.target ? values.target : '',
      };
      const { data } = await updateBotRequest(botBaseInfo);

      if (data.check_not_pass) {
        setCheckErr(true);
        setErrMsg(data.check_not_pass_msg);
        onError?.();
        return;
      }
      setBotInfoByImmer(store => {
        store.icon_uri = values?.bot_uri?.[0].uid;
        store.icon_url = values?.bot_uri?.[0].url;
        store.name = values?.name;
        store.description = values?.target;
      });
      setCollaborationByImmer(store => {
        store.sameWithOnline = data.same_with_online ?? false;
      });
      setPageRuntimeByImmer(store => {
        store.hasUnpublishChange = data.has_change ?? false;
      });
      await onSuccess?.(botId, currentSpaceId, {
        botAvatar: values?.bot_uri?.[0].url,
        botName: values?.name,
        botDesc: values?.target,
      });

      setVisible(false);

      reportEvent.success();
      Toast.success({
        content: I18n.t('Update_success'),
        showClose: false,
      });
    } catch (e) {
      if (e instanceof Error) {
        reportEvent.error({ error: e, reason: e.message });
      }
      onError?.();
      Toast.error({
        content: withSlardarIdButton(I18n.t('Update_failed')),
        showClose: false,
      });
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async () => {
    const values = await getValues();
    setLoading(true);
    const paramsSpaceId =
      values?.spaceId || outerSpaceId || currentSpaceId || list?.[0]?.id || '';
    const personalSpaceInfo = list?.find(
      item => item.space_type === SpaceType.Personal,
    );
    try {
      onBefore?.();
      const resp = await DeveloperApi.DraftBotCreate({
        name: values?.name,
        description: values?.target,
        icon_uri: values?.bot_uri?.[0]?.uid,
        space_id: paramsSpaceId,
        ...(IS_OVERSEA && {
          monetization_conf: { is_enable: values?.enableMonetize },
        }),
        create_from: bizCreateFrom,
      });
      if (resp.data.check_not_pass) {
        setCheckErr(true);
        setErrMsg(resp.data.check_not_pass_msg);
        onError?.();
        return;
      }

      Toast.success({
        content: I18n.t('bot_created_toast'),
        showClose: false,
      });
      // Scenarios that are compatible with onSuccess callbacks as synchronization functions
      await onSuccess?.(resp.data?.bot_id, paramsSpaceId, {
        botName: values?.name,
        botDesc: values?.target,
        botAvatar: values?.bot_uri?.[0]?.url,
      });
      sendTeaEvent(EVENT_NAMES.click_create_bot_confirm, {
        click: 'success',
        bot_id: resp.data?.bot_id,
        create_type: 'create',
      });
      reportTea({ resp, values, personalSpaceInfo, paramsSpaceId });
      reportEvent.success();
      setVisible(false);
      return resp;
    } catch (e) {
      Toast.error({
        content: withSlardarIdButton(I18n.t('Create_failed')),
        showClose: false,
      });
      if (e instanceof Error) {
        reportEvent.error({ error: e, reason: e.message });
        sendTeaEvent(EVENT_NAMES.click_create_bot_confirm, {
          click: 'failed',
          create_type: 'create',
          error_message: e.message,
        });
      }
      onError?.();
      // Prevent pop-ups from closing
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleCreateBot,
    handleUpdateBot,
  };
};
