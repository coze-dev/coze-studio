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

import { type AxiosRequestConfig } from 'axios';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { CustomError } from '@coze-arch/bot-error';
import {
  type BotAPIRequestConfig,
  PlaygroundApi,
  type PlaygroundApiService,
} from '@coze-arch/bot-api';

const apiList = [
  'InviteMemberLinkV2',
  'AddBotSpaceMemberV2',
  'SearchMemberV2',
  'UpdateSpaceMemberV2',
  'RemoveSpaceMemberV2',
  'SpaceMemberDetailV2',
  'DraftBotPublishHistoryDetail',
  'BotInfoAudit',
  'MGetBotByVersion',
];

type ApiType =
  | 'InviteMemberLinkV2'
  | 'AddBotSpaceMemberV2'
  | 'SearchMemberV2'
  | 'RemoveSpaceMemberV2'
  | 'SpaceMemberDetailV2'
  | 'UpdateSpaceMemberV2'
  | 'DraftBotPublishHistoryDetail'
  | 'BotInfoAudit'
  | 'MGetBotByVersion';

export type SpaceRequest<T> = Omit<T, 'space_id'>;

type D = PlaygroundApiService<BotAPIRequestConfig>;

type ExportSpaceService = {
  [K in ApiType]: (
    params: SpaceRequest<Parameters<D[K]>[0]>,
    options?: Parameters<D[K]>[1],
  ) => ReturnType<D[K]>;
};

const getSpaceId = () => useSpaceStore.getState().getSpaceId();

// API that needs to store space id
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SpaceApiV2 = new Proxy(Object.create(null), {
  get(_, funcName: ApiType) {
    const spaceId = getSpaceId();

    if (!apiList.includes(funcName)) {
      throw new CustomError(
        REPORT_EVENTS.parmasValidation,
        `Function ${funcName} is not defined in replace list`,
      );
    }
    return <S extends keyof D>(
      params: SpaceRequest<Parameters<D[S]>[0]>,
      options: AxiosRequestConfig = {},
    ): Promise<ReturnType<D[S]>> =>
      PlaygroundApi[funcName](
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { space_id: spaceId, ...params } as any,
        options,
      ) as Promise<ReturnType<D[S]>>;
  },
}) as ExportSpaceService;
