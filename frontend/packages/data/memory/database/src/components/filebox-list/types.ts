import { type StoreApi, type UseBoundStore } from 'zustand';

export enum FileBoxListType {
  Image = 1,
  Document = 2,
}

export type UseBotStore = UseBoundStore<
  StoreApi<{
    grabPluginId: string;
  }>
>;

export interface FileBoxListProps {
  botId: string;
  useBotStore?: UseBotStore;
  isStore?: boolean;
  onCancel?: () => void;
}
