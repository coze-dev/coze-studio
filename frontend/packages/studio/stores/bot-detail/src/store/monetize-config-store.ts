import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { isNil } from 'lodash-es';
import {
  type BotMonetizationConfigData,
  BotMonetizationRefreshPeriod,
} from '@coze-arch/idl/benefit';

export interface MonetizeConfigState {
  /** 是否开启付费 */
  isOn: boolean;
  /** 开启付费后，用户免费体验的次数 */
  freeCount: number;
  /** 刷新周期 */
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
