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

//  At present, the size information of the file cannot be obtained. If the file is too large, the browser card PDF does not need to be registered for the time being, and then it will be released.
import { JsonPreviewBasePlugin } from '../base';
import OverlayAPI from '../../common/overlay';
import PdfPreviewContent from './preview';

export class PdfPreview extends JsonPreviewBasePlugin {
  name = 'pdf';
  match = (contentType: string) => contentType === 'pdf';
  override priority = 0;
  render = (link: string, extraInfo?: Record<string, string>) => {
    OverlayAPI.show({
      content: onclose => (
        <PdfPreviewContent src={link} extraInfo={extraInfo} onClose={onclose} />
      ),
    });
    return <></>;
  };
}
