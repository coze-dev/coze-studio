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
