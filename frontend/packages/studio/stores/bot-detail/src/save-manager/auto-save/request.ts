import { PlaygroundApi } from '@coze-arch/bot-api';
import { type SaveRequest } from '@coze-studio/autosave';

import { storage } from '@/utils/storage';
import { useBotInfoStore } from '@/store/bot-info';
import { type BizKey, type ScopeStateType } from '@/save-manager/types';

import { saveFetcher } from '../utils/save-fetcher';

/**
 * 自动保存统一请求方法
 */
export const saveRequest: SaveRequest<ScopeStateType, BizKey> = async (
  payload: ScopeStateType,
  itemType: BizKey,
) => {
  const { botId } = useBotInfoStore.getState();

  await saveFetcher(
    async () =>
      await PlaygroundApi.UpdateDraftBotInfoAgw({
        bot_info: {
          bot_id: botId,
          ...payload,
        },
        base_commit_version: storage.baseVersion,
      }),
    itemType,
  );
};
