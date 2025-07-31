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

import { type NodeResult } from '@coze-workflow/base/api';
import { safeJSONParse } from '@coze-arch/bot-utils';

const generateAuth = (result?: NodeResult) => {
  if (!result?.extra) {
    return {
      needAuth: false,
      authLink: '',
    };
  }

  const extra = safeJSONParse(result?.extra, {});
  const auth = extra?.auth || {};
  const { auth_info: authLink, need_auth: needAuth } = auth;

  return {
    needAuth,
    authLink,
  };
};

export { generateAuth };
