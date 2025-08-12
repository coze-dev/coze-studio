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

import { type GetUploadTokenResponse } from '@coze-arch/bot-api/market_interaction_api';
import { DeveloperApi } from '@coze-arch/bot-api';

const TIMEOUT = 60000;

export const getUploadToken: () => Promise<GetUploadTokenResponse> =
  async () => {
    const dataAuth = await DeveloperApi.GetUploadAuthToken(
      {
        scene: 'bot_task',
      },
      { timeout: TIMEOUT },
    );

    const { code, msg, data } = dataAuth;

    return {
      code: Number(code),
      message: msg,
      data: {
        ...data,
        ...data.auth,
      },
    };
  };
