import { useEffect, useState } from 'react';

import { REPORT_EVENTS } from '@coze-arch/report-events';
import {
  type GetModeConfigResponse,
  BotTableRWMode,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { DataNamespace, dataReporter } from '@coze-data/reporter';

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
      let res: GetModeConfigResponse | undefined;
      try {
        res = await MemoryApi.GetModeConfig({
          bot_id: botId,
        });
      } catch (error) {
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
