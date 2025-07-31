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

// Only handle the lowest and highest subscription service gears
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
  polling: boolean; // Whether to enable automatic polling of subscription data
  plans: PremiumPlan[]; // List of paid subscription plans
  subs: PremiumSubs; // All subscription data
  currentPlan: SubscriptionDetail; // Current subscription details
  hasTrial: boolean;
  connections: BindConnection[]; // third-party account connection data
  benefit: SubscriptionDetailV2; // user rights data
  plansCN: Array<MemberVersionRights>; // List of domestic subscription packages
  volcanoInfo: VolcanoInfo; // Oauth jump to the volcano required parameters
}

interface PremiumStoreAction {
  /**
   * reset state
   */
  reset: () => void;
  /**
   * To set whether to poll for subscription data, the following scenarios are required:
   * - Bot details to determine whether the subscription card needs to be displayed
   * - The left menu bar determines whether to display'coze premium'
   * - The left menu bar displays the number of credits
   */
  setPolling: (polling: boolean) => void;
  /**
   * Get a list of overseas subscription packages
   */
  fetchPremiumPlans: () => Promise<{
    plans: PremiumPlan[];
    subs: PremiumSubs;
    hasTrial: boolean;
  }>;
  /**
   * Set up a list of domestic packages
   */
  setPremiumPlansCN: (plans: Array<MemberVersionRights>) => void;
  /**
   * Resume subscription, only overseas for the time being
   */
  renewCurrentPlan: (plan: SubscriptionDetail) => void;
  /**
   * Get the current user subscription details, only overseas for the time being
   */
  fetchPremiumPlan: () => Promise<SubscriptionDetail>;
  /**
   * Cancel the subscription, only overseas for the time being.
   */
  cancelCurrentPlan: () => void;
  /**
   * Get channel binding information, only overseas for the time being.
   */
  fetchConnections: () => Promise<void>;
  /**
   * Cancel the channel user binding, only overseas for the time being
   */
  disconnectUser: (connectorId: string) => void;
  /**
   * Set the current logged in user rights and interests information, common at home and abroad
   */
  setUserBenefit: (benefit: unknown) => void;
  /**
   * Set the current account related volcano information
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
