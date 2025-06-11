import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface DebugPanelStore {
  /** debug panel 展示状态 */
  isDebugPanelShow: boolean;
  /** 当前选中的debug query id */
  currentDebugQueryId: string;
}

interface DebugPanelAction {
  setIsDebugPanelShow: (isDebugPanelShow: boolean) => void;
  setCurrentDebugQueryId: (currentDebugQueryId: string) => void;
}

const DEFAULT_DEBUG_PANEL_STORE = (): DebugPanelStore => ({
  isDebugPanelShow: false,
  currentDebugQueryId: '',
});

export const useDebugStore = create<DebugPanelStore & DebugPanelAction>()(
  devtools(
    set => ({
      ...DEFAULT_DEBUG_PANEL_STORE(),
      setIsDebugPanelShow: isDebugPanelShow => {
        set({ isDebugPanelShow });
      },
      setCurrentDebugQueryId: currentDebugQueryId => {
        set({ currentDebugQueryId });
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.debugPanelStore',
    },
  ),
);
