import { useMemo } from 'react';

import { userStoreService } from '@coze-studio/user-store';
import { type infra } from '@coze-arch/bot-api/debugger_api';

import { TESTSET_CONNECTOR_ID } from '../constants';
import { useGlobalState } from '../../../hooks';

const useTestsetBizCtx = () => {
  const globalState = useGlobalState();

  const spaceID = globalState.spaceId;
  const userInfo = userStoreService.useUserInfo();
  const userID = userInfo?.user_id_str;

  return useMemo<infra.BizCtx>(
    () => ({
      bizSpaceID: spaceID,
      connectorUID: userID,
      connectorID: TESTSET_CONNECTOR_ID,
    }),
    [spaceID, userID],
  );
};

export { useTestsetBizCtx };
