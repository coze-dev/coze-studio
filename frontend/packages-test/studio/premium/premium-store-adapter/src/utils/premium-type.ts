import type {
  PremiumPlan,
  PremiumSubs,
  SKUInfo,
  SubscriptionUserInfo,
} from '../types';

const result = {
  isFree: false,
  isPremiumPlus: false,
  hasLowLevelActive: false,
  hasHighLevelActive: false,
  sub: {},
  activeSub: {},
};
export function formatPremiumType(_props: {
  currentPlan?: SKUInfo;
  plans: PremiumPlan[];
  subs: PremiumSubs;
}): {
  isFree: boolean;
  isPremiumPlus: boolean;
  hasLowLevelActive: boolean;
  hasHighLevelActive: boolean;
  sub: SubscriptionUserInfo;
  activeSub: SubscriptionUserInfo;
} {
  return result;
}
