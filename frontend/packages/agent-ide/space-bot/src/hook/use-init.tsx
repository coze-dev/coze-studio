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

import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { parse } from 'qs';
import { isNumber } from 'lodash-es';
import { userStoreService } from '@coze-studio/user-store';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  autosaveManager,
  avatarBackgroundWebSocket,
  getBotDetailDtoInfo,
  getBotDetailIsReadonly,
  initGenerateImageStore,
  updateBotRequest,
  updateHeaderStatus,
  useGenerateImageStore,
  useMonetizeConfigStore,
  initBotDetailStore,
  useBotDetailStoreSet,
} from '@coze-studio/bot-detail-store';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { BotMode } from '@coze-arch/idl/developer_api';
import { I18n } from '@coze-arch/i18n';
import { exhaustiveCheck } from '@coze-arch/bot-utils';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { Toast } from '@coze-arch/bot-semi';
import { CustomError } from '@coze-arch/bot-error';

import { useBotPageStore } from '../store/bot-page/store';
interface TaskParams {
  from?: 'copy' | 'multi_agent_view_old_ver';
  version?: string;
}

const maxTokenAlertId = '__MODEL_MAX_TOKEN_ALERT__';

const checkShouldAlertMaxToken = (inputMaxToken: number | undefined) => {
  const maxTokenWarningValue = 5;
  if (!isNumber(inputMaxToken)) {
    return false;
  }
  return inputMaxToken <= maxTokenWarningValue;
};

/**
 * Prompt when the user model max_token field < = 5
 * Avoid user misoperation and cannot use the model normally
 */
const modelMaxTokenAlert = () => {
  const { useModelStore, useMultiAgentStore } = useBotDetailStoreSet.getStore();
  const botMode = useBotInfoStore.getState().mode;
  const maxTokens = useModelStore.getState().config.max_tokens;
  const alertI18nKey = 'model_max_token_alert';
  const toastOptions = {
    content: I18n.t(alertI18nKey),
    showClose: true,
    // When duration is set to 0, toast is not automatically turned off and must be turned off manually.
    duration: 0,
    id: maxTokenAlertId,
  };
  if (botMode === BotMode.WorkflowMode) {
    return;
  }

  if (botMode === BotMode.SingleMode) {
    if (checkShouldAlertMaxToken(maxTokens)) {
      Toast.warning(toastOptions);
    }
    return;
  }
  if (botMode === BotMode.MultiMode) {
    const agentList = useMultiAgentStore.getState().agents;
    if (
      agentList.some(agent => checkShouldAlertMaxToken(agent.model.max_tokens))
    ) {
      Toast.warning(toastOptions);
    }
    return;
  }
  exhaustiveCheck(botMode);
};

export type InitStoreSuccessResult = undefined | { disableAutoSave?: boolean };
export type UnmountCallbackResult = undefined | { disableSaveAll?: boolean };
export interface AgentInitCallback {
  onBeforeInitStore: () => void;
  onInitStoreSuccess: (params: { isAbort: boolean }) => InitStoreSuccessResult;
  onUnmount: (params: { isInitializing: boolean }) => UnmountCallbackResult;
}
export interface AgentInitProps {
  initCallback?: Partial<AgentInitCallback>;
}

const startAutosaveManagerConditionally = ({
  init,
  editable,
  callbackRes,
}: {
  init: boolean;
  editable: boolean;
  callbackRes: InitStoreSuccessResult;
}) => {
  if (!(init && editable)) {
    return;
  }
  const disableAutoSave = callbackRes?.disableAutoSave;
  if (disableAutoSave) {
    return;
  }
  autosaveManager.start();
};

const saveAllEdit = async ({ disable }: { disable: boolean | undefined }) => {
  const { botId, mode } = useBotInfoStore.getState();

  // readonly if dependent hook will update lagged. Because clearStore retains the overall value when the page is unloaded
  // So the readonly here needs to be obtained when executed.
  // Increase the status of whether it is offline or without a lock, and if so, do not save it.
  if (!botId || getBotDetailIsReadonly() || disable) {
    return;
  }
  const { botSkillInfo } = getBotDetailDtoInfo();
  const resp = await updateBotRequest({
    ...botSkillInfo,
    bot_mode: mode,
  });
  updateHeaderStatus(resp.data);
};

const useInit = (props: AgentInitProps = { initCallback: {} }) => {
  const { initCallback } = props;
  // TODO: Subsequent locking operations will converge into hooks and no longer invade the business
  // Initialize the store lock, do not execute the page destruction callback before the end of the execution
  const lock = useRef(false);
  // Cancel the initialization function flag bit, and exit the initialization function execution when the page destruction callback is executed first
  const abort = useRef(false);
  const searchParams = parse(location.search.slice(1)) as TaskParams;
  const params = useParams<DynamicParams>();
  const errorHandler = useErrorHandler();

  const userInfo = userStoreService.useUserInfo();

  const { setBotInfo } = useBotInfoStore(
    useShallow(state => ({
      setBotInfo: state.setBotInfo,
    })),
  );
  const { setPageRuntimeBotInfo, getBotSkillBlockCollapsibleState } =
    usePageRuntimeStore(
      useShallow(state => ({
        setPageRuntimeBotInfo: state.setPageRuntimeBotInfo,
        getBotSkillBlockCollapsibleState:
          state.getBotSkillBlockCollapsibleState,
      })),
    );

  const { setBotState } = useBotPageStore(
    useShallow(state => ({
      setBotState: state.setBotState,
    })),
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!params.bot_id) {
      navigate('/', { replace: true });
      return;
    }

    setBotInfo({ botId: params.bot_id });
    setPageRuntimeBotInfo({ pageFrom: BotPageFromEnum.Bot });

    (async () => {
      try {
        lock.current = true;
        initCallback?.onBeforeInitStore?.();
        getBotSkillBlockCollapsibleState();
        await initBotDetailStore({ version: searchParams.version });
        // It needs to determine whether it is read-only and relies on store initialization, so it is placed after initBotDetailStore.
        initGenerateImageStore();
        const isAbort = abort.current;
        const callbackRes = initCallback?.onInitStoreSuccess?.({ isAbort });
        // Determine whether to execute the callback of page destruction first, and exit the function execution
        if (isAbort) {
          return;
        }
        //None of the bots in Explore are their own!!!
        const isSelf =
          useBotInfoStore.getState().creator_id === userInfo?.user_id_str;

        setPageRuntimeBotInfo({ isSelf });
        const { init, editable } = usePageRuntimeStore.getState();
        startAutosaveManagerConditionally({ init, editable, callbackRes });
        if (searchParams.from === 'copy') {
          Toast.success({
            content: I18n.t('bot_copy_success'),
            showClose: false,
          });
          navigate({ search: '' });
        }
        modelMaxTokenAlert();
        lock.current = false;
      } catch (e) {
        errorHandler(
          new CustomError(
            REPORT_EVENTS.BotDetailInitHooks,
            `init hooks error: ${e.message}`,
          ),
        );
      }
    })();

    return () => {
      Toast.close(maxTokenAlertId);
      // Set Cancel Flag
      abort.current = true;
      const unmountRes = initCallback?.onUnmount?.({
        isInitializing: lock.current,
      });
      // Do not execute destruction callback with lock
      if (lock.current) {
        return;
      }
      // When the page leaves, save the edited content in full
      const { botId } = useBotInfoStore.getState();
      saveAllEdit({ disable: unmountRes?.disableSaveAll });

      setBotState({
        // When the page is unloaded, change the previous botId to the current botId
        previousBotID: botId,
      });

      autosaveManager.close();
      setPageRuntimeBotInfo({
        editable: false,
      });

      useMonetizeConfigStore.getState().reset();
      useBotDetailStoreSet.clear();
      useGenerateImageStore.getState().clearGenerateImageStore();
      avatarBackgroundWebSocket.destroy();
    };
  }, []);
};

export { useInit };
