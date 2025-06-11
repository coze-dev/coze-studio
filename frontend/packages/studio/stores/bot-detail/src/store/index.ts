import { useAuditInfoStore } from '@/store/audit-info';

import { useQueryCollectStore } from './query-collect';
import { usePersonaStore } from './persona';
import { usePageRuntimeStore } from './page-runtime';
import { useMultiAgentStore } from './multi-agent';
import { useMonetizeConfigStore } from './monetize-config-store';
import { useModelStore } from './model';
import { useManuallySwitchAgentStore } from './manually-switch-agent-store';
import { useDiffTaskStore } from './diff-task';
import { useCollaborationStore } from './collaboration';
import { useBotSkillStore } from './bot-skill';
import { useBotInfoStore } from './bot-info';

export interface BotDetailStoreSet {
  usePersonaStore: typeof usePersonaStore;
  useQueryCollectStore: typeof useQueryCollectStore;
  useMultiAgentStore: typeof useMultiAgentStore;
  useModelStore: typeof useModelStore;
  useBotSkillStore: typeof useBotSkillStore;
  useBotInfoStore: typeof useBotInfoStore;
  useCollaborationStore: typeof useCollaborationStore;
  usePageRuntimeStore: typeof usePageRuntimeStore;
  useMonetizeConfigStore: typeof useMonetizeConfigStore;
  useManuallySwitchAgentStore: typeof useManuallySwitchAgentStore;
  useDiffTaskStore: typeof useDiffTaskStore;
}

interface UseBotDetailStoreSet {
  getStore: () => BotDetailStoreSet;
  clear: () => void;
}

export const useBotDetailStoreSet: UseBotDetailStoreSet = {
  getStore() {
    return {
      usePersonaStore,
      useQueryCollectStore,
      useMultiAgentStore,
      useModelStore,
      useBotSkillStore,
      useBotInfoStore,
      useCollaborationStore,
      usePageRuntimeStore,
      useMonetizeConfigStore,
      useManuallySwitchAgentStore,
      useAuditInfoStore,
      useDiffTaskStore,
    };
  },
  clear() {
    usePersonaStore.getState().clear();
    useQueryCollectStore.getState().clear();
    useMultiAgentStore.getState().clear();
    useModelStore.getState().clear();
    useBotSkillStore.getState().clear();
    useBotInfoStore.getState().clear();
    useCollaborationStore.getState().clear();
    usePageRuntimeStore.getState().clear();
    useMonetizeConfigStore.getState().reset();
    useManuallySwitchAgentStore.getState().clearAgentId();
    useAuditInfoStore.getState().clear();
    useDiffTaskStore.getState().clear();
  },
};
