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

import { I18n } from '@coze-arch/i18n';

export const REAL_DATA_ID = '0';

export const REAL_DATA_MOCKSET = {
  id: REAL_DATA_ID,
  name: I18n.t('real_data'),
};

// Initialization only real_data
export const MOCK_OPTION_LIST = [REAL_DATA_MOCKSET];

export const POLLING_INTERVAL = 10000;

export const DELAY_TIME = 2000;

export const CONNECTOR_ID = '10000010';
