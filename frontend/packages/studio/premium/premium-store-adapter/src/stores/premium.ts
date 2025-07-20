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
 
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import {
  UserLevel,
  type PremiumPlan,
  type PremiumSubs,
  type SubscriptionDetail,
  type BindConnection,
  type SubscriptionDetailV2,
  type MemberVersionRights,
} from '../types';

// 只处理最低和最高订阅服务档位
export enum PremiumPlanLevel {
  Free = 0,

  PremiumPlus = 20,
}

export enum PremiumChannel {
  Coze = '10000010',
  Telegram = '11000007',
  Discord = '10000028',
}

export interface VolcanoInfo {
  authInstanceId?: string;
  authUserId?: string;
  loading?: boolean;
}

interface PremiumStoreState {
  polling: boolean; // 是否开启订阅数据自动轮询
  plans: PremiumPlan[]; // 付费订阅计划列表
  subs: PremiumSubs; // 所有订阅数据
  currentPlan: SubscriptionDetail; // 当前订阅详情
  hasTrial: boolean;
  connections: BindConnection[]; // 第三方账号连接数据
  benefit: SubscriptionDetailV2; // 用户权益数据
  plansCN: Array<MemberVersionRights>; // 国内订阅套餐列表
  volcanoInfo: VolcanoInfo; // oauth跳转到火山需要用到的参数
}

interface PremiumStoreAction {
  /**
   * 重置状态
   */
  reset: () => void;
  /**
   * 设置是否轮询获取订阅数据，以下场景需要：
   * - Bot详情判断是否需要显示订阅卡片
   * - 左侧菜单栏判断是否需要显示'coze premium'
   * - 左侧菜单栏展示credits数量信息
   */
  setPolling: (polling: boolean) => void;
  /**
   * 获取海外订阅套餐列表
   */
  fetchPremiumPlans: () => Promise<{
    plans: PremiumPlan[];
    subs: PremiumSubs;
    hasTrial: boolean;
  }>;
  /**
   * 设置国内套餐列表
   */
  setPremiumPlansCN: (plans: Array<MemberVersionRights>) => void;
  /**
   * 恢复订阅，暂时只有海外
   */
  renewCurrentPlan: (plan: SubscriptionDetail) => void;
  /**
   * 获取当前用户订阅详情，暂时只有海外
   */
  fetchPremiumPlan: () => Promise<SubscriptionDetail>;
  /**
   * 取消订阅，暂时只有海外
   */
  cancelCurrentPlan: () => void;
  /**
   * 获取渠道绑定信息，暂时只有海外
   */
  fetchConnections: () => Promise<void>;
  /**
   * 取消渠道用户绑定，暂时只有海外
   */
  disconnectUser: (connectorId: string) => void;
  /**
   * 设置当前登录用户权益信息，海内外通用
   */
  setUserBenefit: (benefit: unknown) => void;
  /**
   * 设置当前账号相关火山信息
   */
  setVolcanoInfo: (info: VolcanoInfo) => void;
}

const defaultState: PremiumStoreState = {
  polling: false,
  plans: [],
  subs: {},
  currentPlan: {},
  hasTrial: false,
  connections: [],
  benefit: {
    user_basic_info: {
      user_level: UserLevel.Free,
    },
  },
  plansCN: [],
  volcanoInfo: {},
};

export const usePremiumStore = create<PremiumStoreState & PremiumStoreAction>()(
  devtools(
    (set, get) => ({
      ...defaultState,

      reset: () => {
        console.log('unImplement usePremiumStore reset ');
      },

      setPolling: _polling => {
        console.log('unImplement usePremiumStore setPolling ');
      },

      fetchPremiumPlans: async () => {
        const { plans, subs, hasTrial } = get();
        await 0;
        return { plans, subs, hasTrial };
      },

      setPremiumPlansCN: (plans = []) => {
        set({ plansCN: plans });
      },

      fetchPremiumPlan: async () => {
        await 0;
        return get().currentPlan;
      },

      cancelCurrentPlan: () => {
        console.log('unImplement usePremiumStore cancelCurrentPlan ');
      },

      renewCurrentPlan: _detail => {
        console.log('unImplement usePremiumStore renewCurrentPlan ');
      },

      fetchConnections: async () => {
        await 0;
        console.log('unImplement usePremiumStore fetchConnections ');
      },

      disconnectUser: _connectorId => {
        console.log('unImplement usePremiumStore disconnectUser ');
      },

      setUserBenefit: _benefit => {
        console.log('unImplement usePremiumStore setUserBenefit ');
      },

      setVolcanoInfo: _volcanoInfo => {
        console.log('unImplement usePremiumStore setVolcanoInfo ');
      },
    }),
    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.premiumStore',
    },
  ),
);
