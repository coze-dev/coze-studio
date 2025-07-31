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
  REPORT_EVENTS as ReportEventNames,
  createReportEvent,
} from '@coze-arch/report-events';
import { type BotMonetizationConfigData } from '@coze-arch/idl/benefit';
import { type GetDraftBotInfoAgwData } from '@coze-arch/bot-api/playground_api';
import { type HistoryInfo } from '@coze-arch/bot-api/developer_api';

import { useQueryCollectStore } from '../store/query-collect';
import { usePersonaStore } from '../store/persona';
import { usePageRuntimeStore } from '../store/page-runtime';
import { useMultiAgentStore } from '../store/multi-agent';
import { useMonetizeConfigStore } from '../store/monetize-config-store';
import { useModelStore } from '../store/model';
import { useBotDetailStoreSet } from '../store/index';
import { useCollaborationStore } from '../store/collaboration';
import { useBotSkillStore } from '../store/bot-skill';
import { useBotInfoStore } from '../store/bot-info';
import { useAuditInfoStore } from '../store/audit-info';
import { getBotDataService } from '../services/get-bot-data-service';

export async function initBotDetailStore(params?: {
  version?: HistoryInfo['version'];
  scene?: 'bot' | 'market';
}) {
  const { version, scene = 'bot' } = params ?? {};
  const getRecordEvent = createReportEvent({
    eventName: ReportEventNames.botDebugGetRecord,
  });
  const { botId, version: botInfoVersion } = useBotInfoStore.getState();
  const { setPageRuntimeBotInfo } = usePageRuntimeStore.getState();
  const { clear } = useBotDetailStoreSet;
  try {
    setPageRuntimeBotInfo({ init: false });
    const getBotInfoEvent = createReportEvent({
      eventName: ReportEventNames.botGetDraftBotInfo,
    });
    try {
      const { botData, monetizeConfig = {} } = await getBotDataService({
        scene,
        botId,
        customVersion: version,
        botInfoVersion,
      });
      // Handling bot draft page-specific fields
      if (scene === 'bot') {
        initBotSceneStore(botData, version);
      }
      // Initialize store set
      initBotDetailStoreSet(botData, monetizeConfig);
      getBotInfoEvent.success();
    } catch (e) {
      clear();
      getBotInfoEvent.error({
        reason: 'get new draft bot info fail',
        error: e instanceof Error ? e : void 0,
      });
      throw e;
    }

    getRecordEvent.success();
  } catch (e) {
    getRecordEvent.error({
      reason: 'init fail',
      error: e instanceof Error ? e : void 0,
    });
    throw e;
  }
}

const initBotSceneStore = (info: GetDraftBotInfoAgwData, version?: string) => {
  const { initStore: initPageRuntimeStore } = usePageRuntimeStore.getState();
  const { initStore: initCollaborationStore } =
    useCollaborationStore.getState();
  initPageRuntimeStore({
    ...info,
    customVersion: version,
  });
  initCollaborationStore(info);
};

const initBotDetailStoreSet = (
  botData: GetDraftBotInfoAgwData,
  monetizeConfig: BotMonetizationConfigData,
) => {
  const { initStore: initBotInfoStore } = useBotInfoStore.getState();
  const { initStore: initPersonaStore } = usePersonaStore.getState();
  const { initStore: initModelStore } = useModelStore.getState();
  const { initStore: initBotSkillStore } = useBotSkillStore.getState();
  const { initStore: initMultiAgentStore } = useMultiAgentStore.getState();
  const { initStore: initMonetizeConfigStore } =
    useMonetizeConfigStore.getState();
  const { initStore: initQueryCollectStore } = useQueryCollectStore.getState();
  const { initStore: initAuditInfoStore } = useAuditInfoStore.getState();
  initBotInfoStore(botData);
  initPersonaStore(botData);
  initModelStore(botData);
  initBotSkillStore(botData);
  initMultiAgentStore(botData);
  // Settings Information Payment Information
  initMonetizeConfigStore(monetizeConfig);
  initQueryCollectStore(botData);
  initAuditInfoStore(botData);
};
