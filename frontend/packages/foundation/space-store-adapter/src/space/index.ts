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

/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable max-lines-per-function */
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';
import {
  type SaveSpaceRet,
  type SaveSpaceV2Request,
  type TransferSpaceV2Request,
  type ExitSpaceV2Request,
  type SpaceInfo,
} from '@coze-arch/bot-api/playground_api';
import { type BotSpace, SpaceType } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { polling, reportSpaceListPollingRes } from './utils';

interface SpaceStoreState {
  /** @deprecated try useSpace instead */
  space: BotSpace;
  spaceList: BotSpace[];
  recentlyUsedSpaceList: BotSpace[];
  loading: false | Promise<SpaceInfo | undefined>;
  inited?: boolean;
  createdTeamSpaceNum: number; // Count of team spaces created by individuals
  maxTeamSpaceNum: number;
  /** @deprecated spaceList & maxTeamSpaceNum */
  spaces: {
    bot_space_list: BotSpace[];
    has_personal_space: boolean;
    team_space_num: number;
    max_team_space_num: number;
  };
}

interface SpaceStoreAction {
  reset: () => void;
  /** @deprecated  get id from url */
  getSpaceId: () => string;
  getPersonalSpaceID: () => string | undefined;
  checkSpaceID: (spaceID: string) => boolean;
  /** @deprecated by id index */
  setSpace: (spaceId?: string, isBotDetailIframe?: boolean) => void | never;
  createSpace: (
    request: SaveSpaceV2Request,
  ) => Promise<SaveSpaceRet | undefined>;
  exitSpace: (request: ExitSpaceV2Request) => Promise<string | undefined>;
  deleteSpace: (id: string) => Promise<string | undefined>;
  updateSpace: (request: SaveSpaceV2Request) => Promise<{
    id?: string;
    check_not_pass?: boolean;
  }>;
  transferSpace: (
    request: TransferSpaceV2Request,
  ) => Promise<string | undefined>;
  fetchSpaces: (force?: boolean) => Promise<SpaceInfo | undefined>;
}

const DEFAULT_MAXIMUM_SPACE = 3;

export const defaultState: SpaceStoreState = {
  space: {},
  spaceList: [],
  recentlyUsedSpaceList: [],
  loading: false,
  maxTeamSpaceNum: DEFAULT_MAXIMUM_SPACE,
  createdTeamSpaceNum: 0,
  inited: false,
  spaces: {
    bot_space_list: [],
    has_personal_space: true,
    team_space_num: 0,
    max_team_space_num: DEFAULT_MAXIMUM_SPACE,
  },
};

export const useSpaceStore = create<SpaceStoreState & SpaceStoreAction>()(
  devtools(
    (set, get) => ({
      ...defaultState,
      reset: () => {
        set(defaultState, false, 'reset');
      },
      getSpaceId: () => {
        const { id } = get().space;
        if (!id) {
          throw new CustomError(
            REPORT_EVENTS.parmasValidation,
            'lack space_id',
          );
        }
        return id;
      },
      getPersonalSpaceID: () =>
        get().spaces.bot_space_list?.find(
          space => space.space_type === SpaceType.Personal,
        )?.id,

      checkSpaceID: spaceID =>
        !!get().spaces.bot_space_list?.find(space => space.id === spaceID),

      setSpace: id => {
        const { space, spaces } = get();

        if (id) {
          const targetSapce = spaces.bot_space_list.find(s => s.id === id);
          if (targetSapce) {
            set({ space: targetSapce }, false, 'setSpace');
          } else {
            throw Error(`can not find space: ${id}`);
          }
        } else {
          set(
            {
              space: {
                ...space,
                id: '',
              },
            },
            false,
            'setSpace',
          );
        }
      },

      createSpace: async payload => {
        const res = await PlaygroundApi.SaveSpaceV2(payload);

        if (res.code === 0) {
          return res.data;
        } else {
          throw Error(`create error: ${res.msg}`);
        }
      },

      exitSpace: _ => Promise.resolve(undefined),

      deleteSpace: _ => Promise.resolve(undefined),

      updateSpace: _ => Promise.resolve({}),

      transferSpace: () => Promise.resolve(undefined),

      // eslint-disable-next-line complexity
      fetchSpaces: async (force?: boolean) => {
        const request = async () => {
          const { data } = await PlaygroundApi.GetSpaceListV2({});
          return data;
        };
        const prePromise = get().loading;
        const currentPromise = force ? request() : prePromise || request();
        if (currentPromise !== prePromise) {
          set(
            {
              loading: currentPromise,
            },
            false,
            'fetchSpaces',
          );
        } else {
          return prePromise;
        }

        let res = await currentPromise;

        if (!res?.has_personal_space) {
          await get().createSpace({
            name: 'Personal',
            description: 'Personal Space',
            icon_uri: '',
            space_type: SpaceType.Personal,
          });
          const pollingRes = await polling({
            request,
            isValid: data => (data?.bot_space_list?.length ?? 0) > 0,
          });
          reportSpaceListPollingRes(pollingRes);
          res = pollingRes.data;
        }

        const spaceInfo: SpaceStoreState['spaces'] = {
          bot_space_list: res?.bot_space_list ?? [],
          has_personal_space: res?.has_personal_space ?? true,
          team_space_num: res?.team_space_num ?? 0,
          max_team_space_num: res?.max_team_space_num ?? DEFAULT_MAXIMUM_SPACE,
        };

        set(
          {
            spaceList: spaceInfo.bot_space_list,
            recentlyUsedSpaceList: res?.recently_used_space_list ?? [],
            createdTeamSpaceNum: spaceInfo.team_space_num,
            maxTeamSpaceNum: spaceInfo.max_team_space_num,
            loading: false,
            inited: true,
            spaces: spaceInfo,
          },
          false,
          'fetchSpaces',
        );

        return res;
      },
    }),

    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.spaceStore',
    },
  ),
);
