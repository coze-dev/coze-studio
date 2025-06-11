import { useDebounceFn } from 'ahooks';
import { useMonetizeConfigReadonly } from '@coze-agent-ide/space-bot/hook';
import {
  MonetizeCreditRefreshCycle,
  MonetizeDescription,
  MonetizeFreeChatCount,
  MonetizeSwitch,
} from '@coze-studio/components/monetize';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useMonetizeConfigStore } from '@coze-studio/bot-detail-store';
import {
  MonetizationEntityType,
  type BotMonetizationRefreshPeriod,
} from '@coze-arch/idl/benefit';
import { benefitApi } from '@coze-arch/bot-api';

// 该组件已有通用版本：
// packages/studio/components/src/monetize/monetize-config-panel/index.tsx
export function MonetizeConfigPanel() {
  const botId = useBotInfoStore(store => store.botId);
  // 这里使用了 store 的全部字段，没必要传 selector 了
  const {
    isOn,
    freeCount,
    refreshCycle,
    setIsOn,
    setFreeCount,
    setRefreshCycle,
  } = useMonetizeConfigStore();
  const isReadonly = useMonetizeConfigReadonly();

  const { run: debouncedSaveBotConfig } = useDebounceFn(
    ({
      isEnable,
      freeChats,
    }: {
      isEnable: boolean;
      freeChats: number;
      refreshCycle: BotMonetizationRefreshPeriod;
    }) => {
      benefitApi.PublicSaveBotDraftMonetizationConfig({
        entity_id: botId,
        entity_type: MonetizationEntityType.Bot,
        is_enable: isEnable,
        free_chat_allowance_count: freeChats,
        refresh_period: refreshCycle,
      });
    },
    { wait: 300 },
  );

  const refreshCycleDisabled = !isOn || isReadonly || freeCount <= 0;

  return (
    <div className="w-[480px] p-[24px] flex flex-col gap-[24px]">
      <MonetizeSwitch
        disabled={isReadonly}
        isOn={isOn}
        onChange={value => {
          setIsOn(value);
          debouncedSaveBotConfig({
            isEnable: value,
            freeChats: freeCount,
            refreshCycle,
          });
        }}
      />
      <MonetizeDescription isOn={isOn} />
      <MonetizeFreeChatCount
        isOn={isOn}
        disabled={isReadonly}
        freeCount={freeCount}
        onFreeCountChange={value => {
          setFreeCount(value);
          debouncedSaveBotConfig({
            isEnable: isOn,
            freeChats: value,
            refreshCycle,
          });
        }}
      />
      <MonetizeCreditRefreshCycle
        freeCount={freeCount}
        disabled={refreshCycleDisabled}
        refreshCycle={refreshCycle}
        onRefreshCycleChange={value => {
          setRefreshCycle(value);
          debouncedSaveBotConfig({
            isEnable: isOn,
            freeChats: freeCount,
            refreshCycle: value,
          });
        }}
      />
    </div>
  );
}
