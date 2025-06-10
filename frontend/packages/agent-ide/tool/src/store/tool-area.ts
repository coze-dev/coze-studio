import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type ToolKey, type ToolGroupKey } from '@coze-agent-ide/tool-config';

export interface IRegisteredToolKeyConfig {
  toolGroupKey: ToolGroupKey;
  toolKey: ToolKey;
  toolTitle: string;
  hasValidData: boolean;
}

export interface IRegisteredToolGroupConfig {
  toolGroupKey: ToolGroupKey;
  groupTitle: string;
}

export interface IToolAreaState {
  isInitialed: boolean;
  isModeSwitching: boolean;
  initialedToolKeyList: ToolKey[];
  registeredToolKeyConfigList: IRegisteredToolKeyConfig[];
  registeredToolGroupList: IRegisteredToolGroupConfig[];
}

export interface IToolAreaAction {
  updateIsInitialed: (isInitialed: boolean) => void;
  updateIsModeSwitching: (isModeSwitching: boolean) => void;
  appendIntoInitialedToolKeyList: (toolKey: ToolKey) => void;
  hasToolKeyInInitialedToolKeyList: (toolKey: ToolKey) => boolean;
  setToolHasValidData: (data: {
    toolKey: ToolKey;
    hasValidData: boolean;
  }) => void;
  appendIntoRegisteredToolKeyConfigList: (
    params: IRegisteredToolKeyConfig,
  ) => void;
  appendIntoRegisteredToolGroupList: (
    params: IRegisteredToolGroupConfig,
  ) => void;
  hasToolKeyInRegisteredToolKeyList: (toolKey: ToolKey) => boolean;
  clearStore: () => void;
}

export const createToolAreaStore = () =>
  create<IToolAreaState & IToolAreaAction>()(
    devtools(
      (set, get) => ({
        initialedToolKeyList: [],
        registeredToolKeyConfigList: [],
        registeredToolGroupList: [],
        isInitialed: false,
        isModeSwitching: false,
        appendIntoRegisteredToolKeyConfigList: params => {
          const { toolKey } = params;
          const { registeredToolKeyConfigList } = get();
          if (
            !registeredToolKeyConfigList.find(
              toolKeyConfig => toolKeyConfig.toolKey === toolKey,
            )
          ) {
            set({
              registeredToolKeyConfigList: [
                ...registeredToolKeyConfigList,
                params,
              ],
            });
          }
        },
        hasToolKeyInRegisteredToolKeyList: (toolKey: ToolKey) => {
          const { registeredToolKeyConfigList } = get();
          return Boolean(
            registeredToolKeyConfigList.find(
              toolKeyConfig => toolKeyConfig.toolKey === toolKey,
            ),
          );
        },
        setToolHasValidData: ({ toolKey, hasValidData }) => {
          set(
            produce<IToolAreaState>(state => {
              const tool = state.registeredToolKeyConfigList.find(
                toolConfig => toolConfig.toolKey === toolKey,
              );

              if (tool) {
                tool.hasValidData = hasValidData;
              }
            }),
          );
        },
        appendIntoRegisteredToolGroupList: params => {
          const { registeredToolGroupList } = get();

          if (
            !registeredToolGroupList.find(
              groupConfig => groupConfig.toolGroupKey === params.toolGroupKey,
            )
          ) {
            set({
              registeredToolGroupList: [...registeredToolGroupList, params],
            });
          }
        },
        appendIntoInitialedToolKeyList: (toolKey: ToolKey) => {
          const { initialedToolKeyList } = get();
          if (!initialedToolKeyList.includes(toolKey)) {
            set({
              initialedToolKeyList: [...initialedToolKeyList, toolKey],
            });
          }
        },
        hasToolKeyInInitialedToolKeyList: (toolKey: ToolKey) => {
          const { initialedToolKeyList } = get();
          return initialedToolKeyList.includes(toolKey);
        },
        updateIsInitialed: (isInitialed: boolean) => set({ isInitialed }),
        updateIsModeSwitching: (isModeSwitching: boolean) =>
          set({ isModeSwitching }),
        clearStore: () => {
          set({
            initialedToolKeyList: [],
            registeredToolKeyConfigList: [],
            registeredToolGroupList: [],
            isInitialed: false,
          });
        },
      }),
      {
        name: 'botStudio.tool.ToolAreaStore',
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type ToolAreaStore = ReturnType<typeof createToolAreaStore>;
