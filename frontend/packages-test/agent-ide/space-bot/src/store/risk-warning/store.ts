import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface RiskStore {
  pluginRiskIsRead: boolean;
  toolHiddenModeNewbieGuideIsRead: boolean;
}

interface RiskAction {
  reset: () => void;
  setPluginRiskIsRead: (flag: boolean) => void;
  setToolHiddenModeNewbieGuideIsRead: (flag: boolean) => void;
}

const initialStore: RiskStore = {
  pluginRiskIsRead: true,
  toolHiddenModeNewbieGuideIsRead: true,
  // 支持扩展其它风险提示...
};

export const useRiskWarningStore = create<RiskStore & RiskAction>()(
  devtools(
    set => ({
      ...initialStore,
      reset: () => {
        set(initialStore);
      },
      setPluginRiskIsRead: flag => {
        set({ pluginRiskIsRead: flag });
      },
      setToolHiddenModeNewbieGuideIsRead: flag => {
        set({
          toolHiddenModeNewbieGuideIsRead: flag,
        });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.riskWarningStore',
    },
  ),
);
