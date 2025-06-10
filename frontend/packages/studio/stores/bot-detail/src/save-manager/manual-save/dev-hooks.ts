import { type HookInfo } from '@coze-arch/idl/playground_api';
import { ItemType } from '@coze-arch/bot-api/developer_api';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';

export const saveDevHooksConfig = async (hooksInfo: HookInfo) =>
  saveFetcher(
    () =>
      updateBotRequest({
        hook_info: hooksInfo,
      }),
    ItemType.HOOKINFO,
  );
