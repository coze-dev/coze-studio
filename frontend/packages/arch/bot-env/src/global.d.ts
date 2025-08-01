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

// copy from @byted/uploader
type TUploaderRegion =
  | 'cn-north-1'
  | 'us-east-1'
  | 'ap-singapore-1'
  | 'us-east-red'
  | 'boe'
  | 'boei18n'
  | 'US-TTP'
  | 'gcp';

interface Window {
  gfdatav1?: {
    // deployment area
    region?: string;
    // SCM version
    ver?: number | string;
    // Current environment, the value is boe or prod
    env?: 'boe' | 'prod';
    // Environmental identification, such as prod or ppe_ *
    envName?: string;
    // The current small traffic channel ID, 0 represents full traffic
    canary?: 0;
    extra?: {
      /**
       * @Description The goofy team does not recommend relying on this field. If you can't use it, don't use it.
       * 1 means small traffic.
       * 3 means grey release
       * Null means full traffic
       */
      canaryType?: 1 | 3 | null;
    };
  };
}
