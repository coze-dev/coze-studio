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
