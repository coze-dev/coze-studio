import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import {
  type UserInfoSlice,
  createUserInfoSlice,
} from '@/store/userinfo-slice';

export const useStore = create<UserInfoSlice>()(
  devtools(
    (...a) => ({
      ...createUserInfoSlice(...a),
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'api-builder/app',
    },
  ),
);
