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
