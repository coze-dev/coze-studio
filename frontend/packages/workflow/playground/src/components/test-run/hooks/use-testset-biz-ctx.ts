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
