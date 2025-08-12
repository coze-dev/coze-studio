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

export {
  useBackgroundContent,
  type UseBackgroundContentProps,
} from './hooks/use-background-content';
export { useSubmitCroppedImage } from './hooks/use-submit-cropped-image';
export { useUploadImage } from './hooks/use-upload-img';
export { useDragImage } from './hooks/use-drag-image';
export { useCropperImg } from './hooks/use-crop-image';

export { UploadMode } from './types';

export {
  checkImageWidthAndHeight,
  getModeInfo,
  getOriginImageFromBackgroundInfo,
  getInitBackground,
  computePosition,
  canvasPosition,
  computeThemeColor,
  getImageThemeColor,
} from './utils';

export {
  MAX_AI_LIST_LENGTH,
  MAX_IMG_SIZE,
  FIRST_GUIDE_KEY_PREFIX,
} from './constants';
