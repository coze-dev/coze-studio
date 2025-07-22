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
 
/**
 * @file 开源版暂时不提供企业管理功能，本文件中导出的方法用于未来拓展使用。
 */
/* eslint-disable @typescript-eslint/no-empty-function */
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type GetEnterpriseResponseData,
  type ListEnterpriseResponseData,
} from '@coze-arch/bot-api/pat_permission_api';

import { PERSONAL_ENTERPRISE_ID } from '../constants';

interface EnterpriseStoreState {
  currentEnterprise?: GetEnterpriseResponseData;
  isCurrentEnterpriseInit: boolean;
  enterpriseList?: ListEnterpriseResponseData;
  isEnterpriseListInit: boolean;
  enterpriseId: string;
  isEnterpriseExist: boolean;
}

interface EnterpriseStoreAction {
  setEnterprise: (enterpriseInfo: GetEnterpriseResponseData) => void;
  updateEnterpriseByImmer: (
    update: (enterpriseInfo: GetEnterpriseResponseData) => void,
  ) => void;
  setEnterpriseList: (enterpriseList: ListEnterpriseResponseData) => void;
  setIsCurrentEnterpriseInit: (isInit: boolean) => void;
  setIsEnterpriseListInit: (isInit: boolean) => void;
  setEnterpriseId: (enterpriseId: string) => void;
  clearEnterprise: () => void;
  fetchEnterprise: (enterpriseId: string) => Promise<void>;
  setIsEnterpriseExist: (isExist: boolean) => void;
}

export const defaultState: EnterpriseStoreState = {
  isCurrentEnterpriseInit: true,
  isEnterpriseListInit: true,
  enterpriseId: PERSONAL_ENTERPRISE_ID,
  isEnterpriseExist: true,
};

export const useEnterpriseStore = create<
  EnterpriseStoreState & EnterpriseStoreAction
>()(
  // @ts-expect-error skip
  devtools(
    () => ({
      ...defaultState,
      setEnterprise: (_: GetEnterpriseResponseData) => {},
      updateEnterpriseByImmer: (
        _: (enterpriseInfo: GetEnterpriseResponseData) => void,
      ) => {},
      clearEnterprise: () => {},
      setEnterpriseId: (_: string) => {},
      setIsCurrentEnterpriseInit: (_: boolean) => {},
      setIsEnterpriseListInit: (_: boolean) => {},
      setEnterpriseList: (_: ListEnterpriseResponseData) => {},
      setIsEnterpriseExist: (_: boolean) => {},
      // 获取企业信息，可连续调用，不存在异步竞争问题。
      fetchEnterprise: (_: string) => {},
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.enterpriseStore',
    },
  ),
);
