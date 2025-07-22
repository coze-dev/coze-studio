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
 
import { useMatches, type NavigateFunction } from 'react-router-dom';
import { type FC, useMemo } from 'react';

import { type ScreenRange } from '@coze-arch/responsive-kit';

export interface TRouteConfigGlobal {
  /**
   * 展示小助手
   * @default true
   * @import 开源版不支持该字段
   */
  showAssistant?: boolean;
  /**
   * 展示小助手引导提示
   * @default false
   * @import 开源版不支持该字段
   */
  showAssistantGuideTip?: boolean;
  /**
   * 当企业ID发生变化时的回调函数。
   * @import 开源版不支持该字段
   * @param enterpriseId - 变化后的企业ID。
   * @param params - 包含导航函数和当前路径名的对象。
   */
  onEnterpriseChange?: (
    enterpriseId: string,
    params: {
      navigate: NavigateFunction; // 导航函数，用于路由跳转。
      pathname: string; // 当前路径名，用于构建新的路径。
    },
  ) => void;
  /**
   * 是否展示侧边栏
   * @default false
   */
  hasSider?: boolean;
  /**
   * 展示移动端不适配提示文案
   * @default false
   */
  showMobileTips?: boolean;
  /**
   * 是否需要身份验证
   * @default false
   */
  requireAuth?: boolean;
  /**
   * 登录失效时的回退地址
   * @default /sign
   */
  loginFallbackPath?: string;
  /**
   * @deprecated
   * 是否允许身份验证为可选
   * @default false
   */
  requireAuthOptional?: boolean;
  /**
   * 设置为 true 时自动应用缺省值 { rangeMax: ScreenRange.LG, include: false } 对应之前绝大多数支持响应式路由的配置
   * @default false
   */
  responsive?: { rangeMax: ScreenRange; include?: boolean } | true;
  /**
   * 子菜单组件
   * @default undefined
   */
  subMenu?: FC<Record<string, never>>;
  /**
   * 一级导航菜单项 key
   * @default undefined
   */
  menuKey?: string;
  /**
   * 二级导航菜单项 key
   * @default undefined
   */
  subMenuKey?: string;
  /**
   * 控制是否根据 query 中的 page_mode 字段判断页面模式: 默认侧边导航模式 or 全屏popover模式
   * @default false
   */
  pageModeByQuery?: boolean;
}

export const useRouteConfig = <
  TConfig extends TRouteConfigGlobal = TRouteConfigGlobal,
>(
  defaults?: TConfig,
  // 强制所有字段可能为空
): Partial<TConfig> => {
  const matches = useMatches();

  return useMemo<Partial<TConfig>>(
    () =>
      matches.reduce(
        (res, matchedRoute) => ({
          ...res,
          ...(matchedRoute.handle as Partial<TConfig>),
          ...(matchedRoute.data as Partial<TConfig>),
        }),
        defaults ?? {},
      ),
    [matches],
  );
};
