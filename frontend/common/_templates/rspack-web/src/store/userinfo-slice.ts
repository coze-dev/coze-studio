import { type StateCreator } from 'zustand';

export interface UserInfoSlice {
  userInfo: string;
  iniUserInfo: () => void;
}

export const createUserInfoSlice: StateCreator<
  UserInfoSlice,
  [],
  [],
  UserInfoSlice
> = set => ({
  userInfo: '',
  iniUserInfo: () => {
    // TODO: 用户信息相关方法获取
  },
});
