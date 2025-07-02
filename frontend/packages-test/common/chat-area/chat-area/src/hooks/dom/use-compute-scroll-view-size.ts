import { useSize } from 'ahooks';

import { computedStyleToNumber } from '../../utils/dom/computed-style-to-number';
import { usePreference } from '../../context/preference';

export const useComputeScrollViewSize = ({
  scrollViewWrapper,
}: {
  scrollViewWrapper: HTMLDivElement | null | undefined;
}) => {
  const { isOnboardingCentered, enableImageAutoSize } = usePreference();
  const sizeTarget =
    isOnboardingCentered || enableImageAutoSize ? scrollViewWrapper : null;
  const scrollViewSize = useSize(sizeTarget);
  if (!sizeTarget || !scrollViewSize) {
    return;
  }
  const computedStyle = getComputedStyle(sizeTarget);

  return {
    ...scrollViewSize,
    paddingLeft: computedStyleToNumber(
      computedStyle.getPropertyValue('padding-left'),
    ),
    paddingRight: computedStyleToNumber(
      computedStyle.getPropertyValue('padding-right'),
    ),
  };
};
