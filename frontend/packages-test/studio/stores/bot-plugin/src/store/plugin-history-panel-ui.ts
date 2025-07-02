import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

export interface PluginHistoryPanelUIState {
  isVisible: boolean;
}
export interface PluginHistoryPanelUIAction {
  setVisible: (action: ((prevVisible: boolean) => boolean) | boolean) => void;
}

export const createPluginHistoryPanelUIStore = () =>
  create<PluginHistoryPanelUIState & PluginHistoryPanelUIAction>()(
    devtools(
      (set, get) => ({
        isVisible: false,
        setVisible: action =>
          set(
            {
              isVisible:
                typeof action === 'boolean' ? action : action(get().isVisible),
            },
            false,
            'setVisible',
          ),
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'botStudio.plugin-history-panel-ui',
      },
    ),
  );

export type PluginHistoryPanelUIStore = ReturnType<
  typeof createPluginHistoryPanelUIStore
>;
