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

import { AuthType } from '@coze-studio/open-chat/types';

import { type CozeChatOptions } from '@/types/client';

export class AuthClient {
  readonly options: CozeChatOptions;
  public constructor(options: CozeChatOptions) {
    this.options = options;
  }
  public async initToken() {
    try {
      if (
        this.options.auth?.type === AuthType.TOKEN &&
        !this.options.auth?.token
      ) {
        const token = await this.options.auth?.onRefreshToken?.('');
        this.options.auth.token = token;
        if (!token) {
          alert(
            'The access token is missing. Please check the configuration information.',
          );
        }
        return !!token;
      }
    } catch (_) {
      console.error('[WebSdk Error] initToken error');
      alert(
        'The access token is missing. Please check the configuration information.',
      );

      return false;
    }
    return true;
  }

  public checkOptions() {
    if (this.options.auth?.type !== AuthType.TOKEN) {
      console.error("Non-Token is unsupported; auth's type must be token");
      alert(
        "The auth type (unauth) is unsupported yet; auth's type must be token",
      );
      return false;
    }
    if (this.options.auth?.type === AuthType.TOKEN) {
      if (!this.options.auth.onRefreshToken) {
        console.error('[WebSdk Error] onRefreshToken must be provided');
        alert('onRefreshToken must be provided');
        return false;
      }
      if (typeof this.options.auth.onRefreshToken !== 'function') {
        console.error('[WebSdk Error] onRefreshToken must be a function');
        alert('onRefreshToken  must be a function');
        return false;
      }
    }
    return true;
  }
}
