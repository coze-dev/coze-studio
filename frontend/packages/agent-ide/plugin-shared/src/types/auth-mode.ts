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

/** for open coze */
export enum PluginAuthMode {
  /** No authorization required */
  NoAuth = 0,
  /** Authorization is required, but not configured */
  Required = 1,
  /** Authorization is required and has been configured */
  Configured = 2,
  /** Authorization is required, but the configuration can be empty */
  Supported = 3,
}

export interface AuthMode {
  /** for open coze */
  auth_mode?: PluginAuthMode;
}
