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

import { JsonPreviewBasePlugin } from '../base';
import OverlayAPI from '../../common/overlay';
import { ImagePreviewContent } from './preview';

export class ImagePreview extends JsonPreviewBasePlugin {
  render = (link: string, extraInfo?: Record<string, string>) => {
    OverlayAPI.show({
      content: onclose => <ImagePreviewContent src={link} onClose={onclose} />,
      withMask: false,
    });
    return <></>;
  };
  name = 'Image';
  match = (contentType: string) => contentType === 'image';
  override priority = 0;
}
