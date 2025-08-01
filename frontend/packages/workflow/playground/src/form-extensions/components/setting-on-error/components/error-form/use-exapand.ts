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

import {
  type SettingOnErrorValue,
  useTimeoutConfig,
} from '@coze-workflow/nodes';

/**
 * Whether to expand
 * @param settingOnError
 * @returns
 */
export const useExpand = (settingOnError: SettingOnErrorValue) => {
  const defaultConfig = useTimeoutConfig().default;

  if (settingOnError?.settingOnErrorIsOpen) {
    return true;
  }

  if (settingOnError?.retryTimes) {
    return true;
  }

  if (
    settingOnError?.timeoutMs &&
    settingOnError?.timeoutMs !== defaultConfig
  ) {
    return true;
  }
  return false;
};
