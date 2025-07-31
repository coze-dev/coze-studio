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

import { useGlobalState } from '../../../hooks';

export function useDownloadImages(images: string[]) {
  const {
    info: { name },
  } = useGlobalState();

  const downloadImages = () => {
    images.forEach(url => {
      downloadImage(url, name);
    });
  };

  return downloadImages;
}

async function downloadImage(imageSrc, name) {
  const image = await fetch(imageSrc);
  const imageBlog = await image.blob();
  const imageURL = URL.createObjectURL(imageBlog);

  const link = document.createElement('a');
  link.href = imageURL;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
