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

import { useEffect, useState } from 'react';

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import {
  type GetModeConfigResponse,
  BotTableRWMode,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

export interface ExpertModeConfig {
  isExpertMode: boolean;
  maxTableNum: number;
  maxColumnNum: number;
  readAndWriteModes: BotTableRWMode[];
}

export const useExpertModeConfig = (params: {
  botId: string;
}): ExpertModeConfig => {
  const { botId } = params;

  const defaultConfig = {
    isExpertMode: false,
    maxTableNum: 1,
    maxColumnNum: 10,
    readAndWriteModes: [BotTableRWMode.LimitedReadWrite],
  };
  const [expertConfig, setExpertConfig] =
    useState<ExpertModeConfig>(defaultConfig);

  useEffect(() => {
    (async () => {
      if (!botId) {
        return;
      }
      let res: GetModeConfigResponse | undefined;
      try {
        res = await MemoryApi.GetModeConfig({
          bot_id: botId,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Copy history file
      } catch (error: any) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseGetExpertConfig,
          error,
        });
      }

      if (res) {
        const result: ExpertModeConfig = {
          isExpertMode: res.mode === 'expert',
          maxColumnNum: Number(res.max_column_num),
          maxTableNum: Number(res.max_table_num),
          readAndWriteModes:
            Number(res.max_table_num) > 1
              ? [
                  BotTableRWMode.LimitedReadWrite,
                  BotTableRWMode.UnlimitedReadWrite,
                ]
              : defaultConfig.readAndWriteModes,
        };
        setExpertConfig(result);
      }
    })();
  }, [botId]);

  return expertConfig;
};
