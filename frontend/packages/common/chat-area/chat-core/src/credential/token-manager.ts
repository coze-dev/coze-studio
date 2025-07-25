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
 * 负责 token 验权，自动刷新 token
 * 暴露给业务方，由业务方决定是否单例还是多例鉴权
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
   * 获取 token
   */
  getToken() {
    // TODO: 没有 token，获取最新 token
    return this.token;
  }
  updateToken(token: string) {
    this.token = token;
  }
  updateApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 获取 apiKey
   */
  getApiKey() {
    return this.apiKey;
  }

  /**
   * 获取 apiKey 组装成的 Authorization 值
   */
  getApiKeyAuthorizationValue() {
    return `Bearer ${this?.getApiKey()}`;
  }

  /**
   * 刷新 apiKey
   */
  refreshApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }
  // TODO: 补充刷新机制
}
