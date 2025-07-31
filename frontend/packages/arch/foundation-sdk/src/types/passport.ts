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
 * The uses of the access_token representing the OAuth2 callback are currently:
 * 1. Login: When logging in, perform user mid-platform three-party login (auth/login)
 * 2. delete_account: Get ticket when deleting account (auth/authorized)
 * 3.Oauth: It is time to obtain user authorization when releasing the three-party platform
 */
export type OAuth2StateType = 'login' | 'delete_account' | 'oauth';

export interface OAuth2RedirectConfig {
  /**
   * The final OAuth2 authentication information will be redirected as a route parameter, which specifies the target route address. Be careful to use it on the target route
   * useAuthLoginDataRouteFromOAuth2 to extract the routing parameters and convert them into the parameters of the user's mid-platform three-party login service (authLogin);
   * The default value is the current path name, that is, when the navigatePath parameter is not passed, the current route must be registered useAuthLoginDataRouteFromOAuth2 to be valid
   */
  navigatePath?: string;
  /**
   * The usage scenario of the authentication information obtained after the OAuth2 callback is used to distinguish among some routing components. Those that do not meet the corresponding scenario cannot be used for consumption
   */
  type: OAuth2StateType;
  /**
   * The state field passed to the OAuth2 server is returned during the callback to restore the state of the webpage
   */

  extra?: {
    // @ts-expect-error -- linter-disable-autofix
    origin?: string;
    [x: string]: string; // For safety monitoring
    // @ts-expect-error -- linter-disable-autofix
    encrypt_state?: string; //Encrypted state, used when bind_type 4
  };
  scope?: string;
  optionalScope?: string;
}
