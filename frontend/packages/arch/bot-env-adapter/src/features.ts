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

import { base } from './base';
const { IS_RELEASE_VERSION, IS_OVERSEA, IS_BOE } = base;
export const features = {
  // After communicating with Zhiqiang & products, remove the sso of boe environment.
  FEATURE_ENABLE_SSO: !IS_RELEASE_VERSION && !IS_BOE,
  FEATURE_ENABLE_APP_GUIDE: !IS_RELEASE_VERSION || IS_OVERSEA,
  FEATURE_ENABLE_FEEDBACK_MAILTO: IS_RELEASE_VERSION,
  FEATURE_ENABLE_MSG_DEBUG: !IS_RELEASE_VERSION,
  FEATURE_ENABLE_TABLE_VARIABLE: IS_OVERSEA || !IS_RELEASE_VERSION,
  FEATURE_ENABLE_TABLE_MEMORY: true,
  // FEATURE_ENABLE_RUYI_CARD: false,
  FEATURE_ENABLE_VARIABLE: false,
  /**
   * Whether to start a new cancellation process? Currently only cn is open.
   */
  FEATURE_ENABLE_NEW_DELETE_ACCOUNT: !IS_OVERSEA,
  FEATURE_AWEME_LOGIN: !IS_OVERSEA,
  FEATURE_GOOGLE_LOGIN: IS_OVERSEA,

  /**
   * @Description Only supports workflow code node editing python code in boe environment and inhouse-cn environment
   */
  FEATURE_ENABLE_CODE_PYTHON: !IS_OVERSEA && !IS_RELEASE_VERSION,

  /**
   * Temporarily hide the banner, it may be used later to operate the location
   */
  FEATURE_ENABLE_BANNER: false,

  /**
   * Database tooltip example distinguishes between overseas and domestic
   */
  FEATURE_ENABLE_DATABASE_TABLE: !IS_OVERSEA,

  /**
   * Bot Market China Entrance
   */
  FEATURE_ENABLE_BOT_STORE: true,
  /**
   * Workflow llm billing is only displayed overseas or in-house.
   */
  FEATURE_ENABLE_WORKFLOW_LLM_PAYMENT: IS_OVERSEA || !IS_RELEASE_VERSION,

  /**
   * Bean bag cici special needs, only online in inhouse
   */
  FEATURE_ENABLE_QUERY_ENTRY: !IS_RELEASE_VERSION,
  /**
   * Coze access audit has been added, which is used for the advance of the publishing machine audit pop-up window and the display of the version history Publishing audit results. Currently only CN is effective.
   */
  FEATURE_ENABLE_TCS: !IS_OVERSEA,

  /**
   * Add UG clue return parameters to the data reported by Tea, which is only required for cn release.
   *
   */
  FEATURE_ENABLE_TEA_UG: IS_RELEASE_VERSION && !IS_OVERSEA,
};
