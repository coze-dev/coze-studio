import { type UpdateDraftBotInfoAgwResponse } from '@coze-arch/idl/playground_api';
import { type UserQueryCollectConf } from '@coze-arch/bot-api/developer_api';

import { saveFetcher, updateBotRequest } from '../utils/save-fetcher';
import { ItemTypeExtra } from '../types';

export const updateQueryCollect = async (
  queryCollectConf: UserQueryCollectConf,
) => {
  // @ts-expect-error -- linter-disable-autofix
  let updateResult: UpdateDraftBotInfoAgwResponse = null;

  await saveFetcher(async () => {
    const res = await updateBotRequest({
      user_query_collect_conf: queryCollectConf,
    });

    updateResult = res;
    return res;
  }, ItemTypeExtra.QueryCollect);
  return updateResult;
};
