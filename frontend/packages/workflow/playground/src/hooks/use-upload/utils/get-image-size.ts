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

import { type FileItem } from '../types';

/**
 * Get the width and height of the image
 */
export async function getImageSize(
  file: FileItem,
): Promise<{ width: number; height: number }> {
  const url = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = e => {
      reject(e);
    };
    img.src = url;
  });
}
