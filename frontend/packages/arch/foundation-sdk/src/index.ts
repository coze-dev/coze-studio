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
 * Get the current topic
 */
export declare function useCurrentTheme(): ThemeType;

//------- Passport
/**
 * log out
 */
export declare function logoutOnly(): Promise<void>;

/**
 * Upload user avatar
 * @param file - avatar file
 * @Returns web_uri - URL for avatar file
 */
export declare function uploadAvatar(file: File): Promise<{ web_uri: string }>;
//-------

//------- User

/**
 * Refresh user information
 */
export declare function refreshUserInfo(): Promise<void>;

/**
 * Get login status
 * @returns LoginStatus - checking/logged in/not logged in
 */
export declare function getLoginStatus(): LoginStatus;

/**
 * Get whether the login verification is complete
 * @Returns boolean login verification completed
 */
export declare function getIsSettled(): boolean;

/**
 * Get whether to log in. If you need to get the real login status, please use it with getIsSettled/useIsSettled
 * @deprecated - recommended getLoginStatus
 * @returns boolean whether to log in
 */
export declare function getIsLogined(): boolean;

/**
 * Acquire user information
 * @returns UserInfo | null - user information
 */
export declare function getUserInfo(): UserInfo | null;

/**
 * Obtain user tripartite authorization information
 * @returns Promise<void>
 */
export declare function getUserAuthInfos(): Promise<void>;

/**
 * Responsive access to login status
 * @returns LoginStatus - checking/logged in/not logged in
 */
export declare function useLoginStatus(): LoginStatus;

/**
 * Responsive Get Login Verification Completed
 * @Returns boolean login verification completed
 */
export declare function useIsSettled(): boolean;

/**
 * Responsive to get whether to log in. If you need to get the real login status, please use it with getIsSettled/useIsSettled
 * @deprecated - useLoginStatus
 * @returns boolean whether to log in
 */
export declare function useIsLogined(): boolean;

/**
 * Responsive acquisition of user information
 * @returns UserInfo | null - user information
 */
export declare function useUserInfo(): UserInfo | null;

/**
 * Responsive acquisition of user tripartite authorization information
 * @returns UserAuthInfo[]
 */
export declare function useUserAuthInfo(): UserAuthInfo[];

/**
 * Responsive acquisition of user tags
 * @returns UserLabel
 */
export declare function useUserLabel(): UserLabel | null;

/**
 * Subscribe to UserAuthInfo Changes
 * @param callback - callback function
 */
export declare function subscribeUserAuthInfos(
  callback: (state: UserAuthInfo[], prev: UserAuthInfo[]) => void,
): () => void;

//------- layout component

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
 * Get space information based on spaceId
 */
export declare function useSpace(spaceId: string): BotSpace | undefined;
