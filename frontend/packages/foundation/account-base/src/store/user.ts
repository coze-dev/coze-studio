import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import {
  type UserAuthInfo,
  type UserLabel,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, PlaygroundApi } from '@coze-arch/bot-api';

import { type UserInfo } from '../types';

export interface UserStoreState {
  isSettled: boolean;
  hasError: boolean;
  userInfo: UserInfo | null;
  userAuthInfos: UserAuthInfo[];
  userLabel: UserLabel | null;
}

export interface UserStoreAction {
  reset: () => void;
  setIsSettled: (isSettled: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  getUserAuthInfos: () => Promise<void>;
}

export const defaultState: UserStoreState = {
  isSettled: false,
  userInfo: null,
  hasError: false,
  userAuthInfos: [],
  userLabel: null,
};

export const useUserStore = create<UserStoreState & UserStoreAction>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...defaultState,
      reset: () => {
        set({ ...defaultState, isSettled: true });
      },
      setIsSettled: isSettled => {
        set({
          isSettled,
        });
      },
      setUserInfo: (userInfo: UserInfo | null) => {
        if (
          userInfo?.user_id_str &&
          userInfo?.user_id_str !== get().userInfo?.user_id_str
        ) {
          fetchUserLabel(userInfo?.user_id_str);
        }
        set({
          userInfo,
        });
      },
      getUserAuthInfos: async () => {
        const { data = [] } = await DeveloperApi.GetUserAuthList();
        set({ userAuthInfos: data });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.userStore',
    },
  ),
);

const fetchUserLabel = async (id: string) => {
  const res = await PlaygroundApi.MGetUserBasicInfo({ user_ids: [id] });
  const userLabel = res?.id_user_info_map?.[id]?.user_label;
  useUserStore.setState({ userLabel });
};
