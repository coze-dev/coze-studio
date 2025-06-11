import { isUndefined } from 'lodash-es';
import {
  EXPECT_CONTEXT_WIDTH_MOBILE,
  EXPECT_CONTEXT_WIDTH_PC,
  MD_BOX_INNER_PADDING,
} from '@coze-common/chat-uikit';
import { Layout } from '@coze-common/chat-uikit-shared';

import { useScrollViewSize } from '../../context/scroll-view-size';
import { usePreference } from '../../context/preference';

export const useUIKitMessageImageAutoSizeConfig = () => {
  const { enableImageAutoSize, imageAutoSizeContainerWidth, layout } =
    usePreference();
  const { width, paddingLeft, paddingRight } = useScrollViewSize() ?? {};

  if (
    enableImageAutoSize &&
    isUndefined(imageAutoSizeContainerWidth) &&
    isUndefined(width)
  ) {
    return {
      enableImageAutoSize: false,
      imageAutoSizeContainerWidth: undefined,
    };
  }

  const mdBoxWidth = (width ?? 0) - (paddingLeft ?? 0) - (paddingRight ?? 0);

  const autoWidth =
    mdBoxWidth -
    (layout === Layout.MOBILE
      ? EXPECT_CONTEXT_WIDTH_MOBILE
      : EXPECT_CONTEXT_WIDTH_PC) -
    MD_BOX_INNER_PADDING;

  return {
    enableImageAutoSize,
    imageAutoSizeContainerWidth: imageAutoSizeContainerWidth ?? autoWidth,
  };
};
