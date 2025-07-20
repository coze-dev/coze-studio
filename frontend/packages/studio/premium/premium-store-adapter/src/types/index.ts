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
 
import {
  type SubscriptionBenefitDetail,
  type SKUInfo,
  type SubscriptionUserInfo,
  type SubscriptionDetail,
  type SubscriptionRelateBenefit,
  type MemberVersionRights,
  type SubscriptionDetailV2,
} from '@coze-arch/bot-api/trade';
import { type BindConnection } from '@coze-arch/bot-api/developer_api';

export enum UserLevel {
  /** 免费版。 */
  Free = 0,
  /** 海外
PremiumLite */
  PremiumLite = 10,
  /** Premium */
  Premium = 15,
  PremiumPlus = 20,
  /** 国内
V1火山专业版 */
  V1ProInstance = 100,
  /** 个人旗舰版 */
  ProPersonal = 110,
  /** 团队版 */
  Team = 120,
  /** 企业版 */
  Enterprise = 130,
}

export type {
  MemberVersionRights,
  SubscriptionDetail,
  BindConnection,
  SubscriptionDetailV2,
  SubscriptionUserInfo,
  SKUInfo,
};
export type PremiumPlan = SKUInfo & {
  benefit_info?: SubscriptionBenefitDetail;
  relate_benefit?: SubscriptionRelateBenefit;
};

export type PremiumSubs = Record<string, SubscriptionUserInfo>;
