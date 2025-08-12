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

export const getImageDisplayAttribute = (
  width: number,
  height: number,
  contentWidth: number,
) => {
  // image scale
  const imageRatio = width / height;

  // display width
  let displayWidth = contentWidth;
  // display height
  let displayHeight = contentWidth / imageRatio;
  // Whether to cut
  let isCover = false;

  // (Small size drawing)

  if (width <= contentWidth && height <= 240) {
    displayWidth = width;
    displayHeight = height;
  } else if (imageRatio > contentWidth / 120) {
    displayWidth = contentWidth;
    displayHeight = 120;
    isCover = true;
    // (Long vertical) Image width: Image height < = 0.5
  } else if (imageRatio <= 0.5) {
    displayWidth = 120;
    displayHeight = 240;
    isCover = true;
    // (Equivalent display picture)
  } else if (0.5 <= imageRatio && imageRatio <= contentWidth / 240) {
    displayWidth = 240 * imageRatio;
    displayHeight = 240;
    // (Medium and long horizontal chart)
  } else if (
    contentWidth / 240 <= imageRatio &&
    imageRatio <= contentWidth / 240
  ) {
    displayWidth = contentWidth;
    displayHeight = contentWidth / imageRatio;
  }

  return {
    displayHeight,
    displayWidth,
    isCover,
  };
};
