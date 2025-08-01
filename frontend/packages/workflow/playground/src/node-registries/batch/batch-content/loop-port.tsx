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

import { Port } from '@/components/node-render/node-render-new/fields/port';

export const BatchPort = () => (
  <>
    <Port
      id={'batch-output-to-function'}
      type="output"
      style={{
        position: 'absolute',
        width: 20,
        height: 20,
        right: 'unset',
        top: 'unset',
        bottom: 0,
        left: '50%',
        transform: 'translate(-50%, 50%)',
      }}
    />
    <Port
      id={'batch-output'}
      type="output"
      style={{
        position: 'absolute',
        right: '0',
      }}
    />
  </>
);
