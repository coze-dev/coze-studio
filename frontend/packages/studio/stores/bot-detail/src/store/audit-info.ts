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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type AuditInfo } from '@coze-arch/idl/playground_api';
import { type GetDraftBotInfoAgwData } from '@coze-arch/bot-api/playground_api';

import {
  type SetterAction,
  setterActionFactory,
} from '../utils/setter-factory';

export const getDefaultAuditInfoStore = (): AuditInfoStore => ({
  audit_status: 1,
});

export type AuditInfoStore = AuditInfo;

export interface AuditInfoAction {
  setAuditInfo: SetterAction<AuditInfoStore>;
  setAuditInfoByImmer: (update: (state: AuditInfoStore) => void) => void;
  initStore: (botData: GetDraftBotInfoAgwData) => void;
  clear: () => void;
}

export const useAuditInfoStore = create<AuditInfoStore & AuditInfoAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...getDefaultAuditInfoStore(),
      setAuditInfo: setterActionFactory<AuditInfoStore>(set),
      setAuditInfoByImmer: update =>
        set(produce<AuditInfoStore>(auditInfo => update(auditInfo))),
      initStore: botData => {
        const { setAuditInfo } = get();
        botData && setAuditInfo(botData?.latest_audit_info ?? {});
      },
      clear: () => {
        set({ ...getDefaultAuditInfoStore() });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.auditInfo',
    },
  ),
);
