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

import { extractEnvValue } from '../utils/config-helper';

const VOLCANO_PLATFORM_ID = extractEnvValue<number | null>({
  cn: {
    boe: 0,
    inhouse: 0,
    release: 0,
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

const VOLCANO_PLATFORM_APP_KEY = extractEnvValue<string | null>({
  cn: {
    boe: '0',
    inhouse: '0',
    release: '0',
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

const VOLCANO_IDENTITY_DOMAIN = extractEnvValue<string | null>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

export const volcanoConfigs = {
  VOLCANO_PLATFORM_ID,
  VOLCANO_PLATFORM_APP_KEY,
  VOLCANO_IDENTITY_DOMAIN,
};
