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

import { useTestRunOutputsValue } from './use-test-run-outputs-value';
import { useParseImages } from './use-parse-images';
import { useDownloadImages } from './use-download-images';
export function useImages(): {
  images: string[];
  downloadImages: () => void;
} {
  const outputsValue = useTestRunOutputsValue();
  const images = useParseImages(outputsValue);
  const downloadImages = useDownloadImages(images);

  return {
    images,
    downloadImages,
  };
}
