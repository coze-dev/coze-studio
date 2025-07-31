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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { isNil } from 'lodash-es';
import {
  type BotMonetizationConfigData,
  BotMonetizationRefreshPeriod,
} from '@coze-arch/idl/benefit';

export interface MonetizeConfigState {
  /** Whether to start payment */
  isOn: boolean;
  /** The number of free user experiences after starting payment */
  freeCount: number;
  /** refresh cycle */
  refreshCycle: BotMonetizationRefreshPeriod;
}

export interface MonetizeConfigAction {
  setIsOn: (isOn: boolean) => void;
  setFreeCount: (freeCount: number) => void;
  setRefreshCycle: (refreshCycle: BotMonetizationRefreshPeriod) => void;
  initStore: (data: BotMonetizationConfigData) => void;
  reset: () => void;
}

const DEFAULT_STATE: () => MonetizeConfigState = () => ({
  isOn: false,
  freeCount: 0,
  refreshCycle: 1,
});

export type MonetizeConfigStore = MonetizeConfigState & MonetizeConfigAction;

export const useMonetizeConfigStore = create<MonetizeConfigStore>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_STATE(),

      setIsOn: isOn => set({ isOn }),
      setFreeCount: freeCount => set({ freeCount }),
      setRefreshCycle: refreshCycle => set({ refreshCycle }),
      initStore: data => {
        const { setIsOn, setFreeCount, setRefreshCycle } = get();
        setIsOn(isNil(data?.is_enable) ? true : data.is_enable);
        setFreeCount(
          isNil(data?.free_chat_allowance_count)
            ? 0
            : data.free_chat_allowance_count,
        );
        setRefreshCycle(
          data?.refresh_period ?? BotMonetizationRefreshPeriod.Never,
        );
      },
      reset: () => set(DEFAULT_STATE()),
    }),
    { enabled: IS_DEV_MODE, name: 'botStudio.monetizeConfig' },
  ),
);
