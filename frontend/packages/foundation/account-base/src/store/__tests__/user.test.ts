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

import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { DeveloperApi, PlaygroundApi } from '@coze-arch/bot-api';

import { useUserStore, defaultState } from '../user';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetUserAuthList: vi.fn(),
  },
  PlaygroundApi: {
    MGetUserBasicInfo: vi.fn(),
  },
}));

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState(defaultState);
    vi.clearAllMocks();
  });

  it('should have the correct default state', () => {
    const state = useUserStore.getState();
    expect(state.isSettled).toBe(false);
    expect(state.userInfo).toBeNull();
    expect(state.hasError).toBe(false);
    expect(state.userAuthInfos).toEqual([]);
    expect(state.userLabel).toBeNull();
  });

  describe('actions', () => {
    it('reset should reset state to default and set isSettled to true', () => {
      useUserStore.setState({
        userInfo: { user_id_str: '123' } as any,
        isSettled: false,
      });
      useUserStore.getState().reset();
      const state = useUserStore.getState();
      expect(state.userInfo).toBeNull();
      expect(state.userAuthInfos).toEqual([]);
      expect(state.userLabel).toBeNull();
      expect(state.isSettled).toBe(true);
      expect(state.hasError).toBe(false);
    });

    it('setIsSettled should update isSettled', () => {
      useUserStore.getState().setIsSettled(true);
      expect(useUserStore.getState().isSettled).toBe(true);
      useUserStore.getState().setIsSettled(false);
      expect(useUserStore.getState().isSettled).toBe(false);
    });

    describe('setUserInfo', () => {
      it('should update userInfo', () => {
        const newUserInfo = {
          user_id_str: 'testUser',
          name: 'Test User',
        } as any;
        useUserStore.getState().setUserInfo(newUserInfo);
        expect(useUserStore.getState().userInfo).toEqual(newUserInfo);
      });

      it('should call fetchUserLabel if user_id_str changes', async () => {
        const newUserInfo = {
          user_id_str: 'newUser123',
          name: 'New User',
        } as any;
        const initialUserInfo = {
          user_id_str: 'oldUser456',
          name: 'Old User',
        } as any;

        // Set an initial user
        useUserStore.setState({ userInfo: initialUserInfo });

        (PlaygroundApi.MGetUserBasicInfo as Mock).mockResolvedValueOnce({
          id_user_info_map: {
            [newUserInfo.user_id_str]: {
              user_label: { label_type: 1, text: 'Test Label' },
            },
          },
        });

        useUserStore.getState().setUserInfo(newUserInfo);
        expect(useUserStore.getState().userInfo).toEqual(newUserInfo);

        await vi.waitFor(() => {
          expect(PlaygroundApi.MGetUserBasicInfo).toHaveBeenCalledWith({
            user_ids: [newUserInfo.user_id_str],
          });
        });
        await vi.waitFor(() => {
          expect(useUserStore.getState().userLabel).toEqual({
            label_type: 1,
            text: 'Test Label',
          });
        });
      });

      it('should not call fetchUserLabel if user_id_str is the same', () => {
        const userInfo = { user_id_str: 'user123', name: 'Test User' } as any;
        useUserStore.setState({ userInfo });

        useUserStore.getState().setUserInfo(userInfo);
        expect(PlaygroundApi.MGetUserBasicInfo).not.toHaveBeenCalled();
      });
    });

    describe('getUserAuthInfos', () => {
      it('should fetch and set userAuthInfos on success', async () => {
        const mockAuthInfos = [
          { auth_type: 'email', auth_key: 'test@example.com' },
        ];
        (DeveloperApi.GetUserAuthList as Mock).mockResolvedValueOnce({
          data: mockAuthInfos,
        });

        await useUserStore.getState().getUserAuthInfos();

        expect(DeveloperApi.GetUserAuthList).toHaveBeenCalledTimes(1);
        expect(useUserStore.getState().userAuthInfos).toEqual(mockAuthInfos);
      });
    });
  });
});
