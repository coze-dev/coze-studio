import { type StateCreator } from 'zustand';
import {
  type OpenSearchConfig,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';

export interface IStorageStrategyState {
  enableStorageStrategy: boolean;
  storageLocation: StorageLocation;
  openSearchConfig: OpenSearchConfig;
  testConnectionSuccess: boolean;
}

export interface IStorageStrategyAction {
  setEnableStorageStrategy: (enableStorageStrategy: boolean) => void;
  setStorageLocation: (storageLocation: StorageLocation) => void;
  setOpenSearchConfig: (openSearchConfig: OpenSearchConfig) => void;
  setTestConnectionSuccess: (testConnectionSuccess: boolean) => void;
}

export type IStorageStrategySlice = IStorageStrategyState &
  IStorageStrategyAction;

export const getDefaultStorageStrategyState = (): IStorageStrategyState => ({
  enableStorageStrategy: false,
  storageLocation: StorageLocation.Default,
  openSearchConfig: {},
  testConnectionSuccess: false,
});

export const createStorageStrategySlice: StateCreator<
  IStorageStrategySlice
> = set => ({
  ...getDefaultStorageStrategyState(),
  setEnableStorageStrategy: (enableStorageStrategy: boolean) =>
    set({ enableStorageStrategy }),
  setStorageLocation: (storageLocation: StorageLocation) =>
    set({ storageLocation }),
  setOpenSearchConfig: (openSearchConfig: OpenSearchConfig) =>
    set({ openSearchConfig }),
  setTestConnectionSuccess: (testConnectionSuccess: boolean) =>
    set({ testConnectionSuccess }),
});
