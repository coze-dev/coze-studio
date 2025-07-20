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
