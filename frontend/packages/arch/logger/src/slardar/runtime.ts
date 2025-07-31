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

import { reporter } from '../reporter';

export const getSlardarInstance = () => reporter.slardarInstance;

// Set coze's uid information asynchronously
export const setUserInfoContext = (userInfo: DataItem.UserInfo) => {
  const slardarInstance = getSlardarInstance();
  if (slardarInstance) {
    slardarInstance?.('context.set', 'coze_uid', userInfo?.user_id_str);
  }
};
