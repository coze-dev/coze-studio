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

/**
 * Responsible for token verification, automatically refresh the token
 * Exposed to the service party, the service party decides whether to single-case or multiple-case authentication
 */
export interface TokenManagerProps {
  token?: string;
  // Authorization: Bearer {sdk_verify_token}
  apiKey?: string;
  tokenRefresher?: () => Promise<string>;
}
export default class TokenManager {
  private token?: string;

  private apiKey?: string;

  private tokenRefresher?: () => Promise<string>;

  constructor(props: TokenManagerProps) {
    const { token, tokenRefresher, apiKey } = props;
    this.token = token;
    this.apiKey = apiKey;
    this.tokenRefresher = tokenRefresher;
  }

  /**
   * Get token
   */
  getToken() {
    // TODO: No token, get the latest token
    return this.token;
  }
  updateToken(token: string) {
    this.token = token;
  }
  updateApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get apiKey
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * Get the Authorization value assembled by apiKey
   */
  getApiKeyAuthorizationValue() {
    return `Bearer ${this?.getApiKey()}`;
  }

  /**
   * Refresh apiKey
   */
  refreshApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  // TODO: Supplementary refresh mechanism
}
