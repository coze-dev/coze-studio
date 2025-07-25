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
 
import { type ReactNode, type FC } from 'react';

import {
  type UserAuthInfo,
  type UserLabel,
  type BotSpace,
} from '@coze-arch/idl/developer_api';
import { type DropDownMenuItemItem } from '@coze-arch/coze-design';

export {
  type OAuth2RedirectConfig,
  type OAuth2StateType,
  type UserInfo,
  type UserConnectItem,
  type ThemeType,
  type LoginStatus,
  type BackButtonProps,
  type NavBtnProps,
} from './types';

import type {
  LoginStatus,
  ThemeType,
  UserInfo,
  BackButtonProps,
} from './types';

/**
 * 获取当前主题
 */
export declare function useCurrentTheme(): ThemeType;

//------- Passport
/**
 * 退出登录
 */
export declare function logoutOnly(): Promise<void>;

/**
 * 上传用户头像
 * @param file - 头像文件
 * @returns web_uri - 头像文件对应的 url
 */
export declare function uploadAvatar(file: File): Promise<{ web_uri: string }>;
//-------

//------- User

/**
 * 刷新用户信息
 */
export declare function refreshUserInfo(): Promise<void>;

/**
 * 获取登录状态
 * @returns LoginStatus - 检查中/已登录/未登录
 */
export declare function getLoginStatus(): LoginStatus;

/**
 * 获取登录校验是否完成
 * @returns boolean 登录校验是否完成
 */
export declare function getIsSettled(): boolean;

/**
 * 获取是否登录，如需要获取真实登录状态，请配合 getIsSettled/useIsSettled 使用
 * @deprecated - 推荐使用 getLoginStatus
 * @returns boolean 是否登录
 */
export declare function getIsLogined(): boolean;

/**
 * 获取用户信息
 * @returns UserInfo | null - 用户信息
 */
export declare function getUserInfo(): UserInfo | null;

/**
 * 获取用户三方授权信息
 * @returns Promise<void>
 */
export declare function getUserAuthInfos(): Promise<void>;

/**
 * 响应式获取登录状态
 * @returns LoginStatus - 检查中/已登录/未登录
 */
export declare function useLoginStatus(): LoginStatus;

/**
 * 响应式获取登录校验是否完成
 * @returns boolean 登录校验是否完成
 */
export declare function useIsSettled(): boolean;

/**
 * 响应式获取是否登录，如需要获取真实登录状态，请配合 getIsSettled/useIsSettled 使用
 * @deprecated - 推荐使用 useLoginStatus
 * @returns boolean 是否登录
 */
export declare function useIsLogined(): boolean;

/**
 * 响应式获取用户信息
 * @returns UserInfo | null - 用户信息
 */
export declare function useUserInfo(): UserInfo | null;

/**
 * 响应式获取用户三方授权信息
 * @returns UserAuthInfo[]
 */
export declare function useUserAuthInfo(): UserAuthInfo[];

/**
 * 响应式获取用户用户标签
 * @returns UserLabel
 */
export declare function useUserLabel(): UserLabel | null;

/**
 * 订阅 UserAuthInfo 变化
 * @param callback - 回调函数
 */
export declare function subscribeUserAuthInfos(
  callback: (state: UserAuthInfo[], prev: UserAuthInfo[]) => void,
): () => void;

//------- layout组件

// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const SideSheetMenu: FC;
// eslint-disable-next-line @typescript-eslint/naming-convention
export declare const BackButton: FC<BackButtonProps>;

//-------

export interface MenuItem {
  label: string;
  icon?: ReactNode;
  url?: string;
  menu?: Array<DropDownMenuItemItem>;
  popover?: ReactNode;
  renderType: 'link' | 'popover' | 'menu' | 'comp' | 'test-new-link';
  comp?: React.JSX.Element;
}

/**
 * 根据spaceId获取space信息
 */
export declare function useSpace(spaceId: string): BotSpace | undefined;
