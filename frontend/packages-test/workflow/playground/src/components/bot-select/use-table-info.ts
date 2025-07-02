import { type BotTable, BotTableRWMode } from '@coze-arch/bot-api/memory';

import { transformBotInfo, useBotInfo } from './use-bot-info';

// 多人模式下产品希望前端展示uuid & id 目前这两个字段会被后端过滤 先由前端补充这两个字段 后端充分评估过再移除过滤逻辑
function addUidAndIdToBotFieldsIfIsUnlimitedReadWriteMode(
  tableInfo: BotTable[],
): BotTable[] {
  tableInfo.forEach(bot => {
    if (
      bot.rw_mode === BotTableRWMode.UnlimitedReadWrite &&
      (bot?.field_list?.length as number) > 0
    ) {
      ['id', 'uuid'].forEach(name => {
        const fieldExisted = !!bot.field_list?.find(
          field => field.name === name,
        );
        if (!fieldExisted) {
          bot.field_list?.unshift({ name });
        }
      });
    }
  });

  return tableInfo;
}

export const useTableInfo = (botID?: string) => {
  const { isLoading, botInfo } = useBotInfo(botID);
  let tableInfo: BotTable[] | undefined;
  tableInfo = transformBotInfo.database(botInfo);
  if (tableInfo) {
    tableInfo = addUidAndIdToBotFieldsIfIsUnlimitedReadWriteMode(tableInfo);
  }

  return { tableInfo, isLoading };
};
