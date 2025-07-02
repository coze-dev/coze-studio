import { useScrollViewSize } from '../../context/scroll-view-size';
import { usePreference } from '../../context/preference';

export const useOnboardingCenterOffset = ({
  onboardingHeight = 0,
  // 默认最小 margin by ui 设计顶部预留 24px 由 top-safe-area 撑起
  minOffset = 0,
}: {
  onboardingHeight?: number;
  minOffset?: number;
}) => {
  const { isOnboardingCentered } = usePreference();
  const scrollViewSize = useScrollViewSize();
  if (!isOnboardingCentered) {
    return;
  }

  if (!scrollViewSize?.height) {
    return;
  }

  return Math.max((scrollViewSize.height - onboardingHeight) / 2, minOffset);
};
