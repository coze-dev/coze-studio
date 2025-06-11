import { type SubscriptionDetail } from '../types';
const defaultData = {
  isFree: false,
  isPremiumPlus: false,
  hasLowLevelActive: false,
  hasHighLevelActive: false,
  sub: {},
  activeSub: {},
};
export function usePremiumType(): {
  isFree: boolean;
  isPremiumPlus: boolean;
  hasLowLevelActive: boolean;
  hasHighLevelActive: boolean;
  sub: SubscriptionDetail;
  activeSub: SubscriptionDetail;
} {
  return defaultData;
}
