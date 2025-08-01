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

import dayjs from 'dayjs';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { type BotInfoForUpdate } from '@coze-arch/idl/playground_api';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { type UpdateDraftBotResponse } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { useBotInfoStore } from '@/store/bot-info';

import { type BizKey } from '../types';
import { storage } from '../../utils/storage';
import { usePageRuntimeStore } from '../../store/page-runtime';
import { useCollaborationStore } from '../../store/collaboration';

export async function saveFetcher(
  saveRequest: () => Promise<UpdateDraftBotResponse>,
  scopeKey: BizKey,
) {
  const { editable, isPreview, pageFrom, init, setPageRuntimeByImmer } =
    usePageRuntimeStore.getState();

  const { setCollaborationByImmer } = useCollaborationStore.getState();
  const isReadonly = () =>
    !editable || isPreview || pageFrom === BotPageFromEnum.Explore;

  if (isReadonly() || !init) {
    return;
  }

  try {
    setPageRuntimeByImmer(state => {
      state.savingInfo.saving = true;
      state.savingInfo.scopeKey = scopeKey ? String(scopeKey) : '';
    });

    const res = await saveRequest();

    setPageRuntimeByImmer(state => {
      state.savingInfo = {
        saving: false,
        time: dayjs().format('HH:mm:ss'),
      };
    });

    if (res) {
      setPageRuntimeByImmer(state => {
        state.hasUnpublishChange = res.data.has_change ?? false;
      });
      setCollaborationByImmer(state => {
        state.sameWithOnline = res.data.same_with_online ?? false;
        if (state.branch && res.data.branch) {
          state.branch = res.data.branch;
        }
      });
    }
    reporter.successEvent({
      eventName: ReportEventNames.AutosaveSuccess,
      meta: { itemType: scopeKey },
    });
  } catch (e) {
    reporter.errorEvent({
      eventName: ReportEventNames.AutosaveError,
      error: e as Error,
      meta: { itemType: scopeKey },
    });
  }
}

/**
 * Update the structure of bot draft information
 * @Returns update bots using different request bodies based on tags
 */
export function updateBotRequest(structPayload: BotInfoForUpdate) {
  const { botId } = useBotInfoStore.getState();
  return PlaygroundApi.UpdateDraftBotInfoAgw({
    bot_info: {
      bot_id: botId,
      ...structPayload,
    },
    base_commit_version: storage.baseVersion,
  });
}
