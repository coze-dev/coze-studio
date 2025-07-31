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

import { type RightPanelConfigType } from '../../type';
import { ContextMenuConfigMap } from './constant';

/**
 * The main replacement resource tree is supported by default, right-click menu configuration,
 * And wraps the id of the right-click menu injected by the three parties.
 */
export const handleConfig = (
  baseConfig: RightPanelConfigType[],
): RightPanelConfigType[] =>
  baseConfig.map(config => {
    if ('type' in config) {
      return config;
    }
    if (ContextMenuConfigMap[config.id]) {
      return {
        ...ContextMenuConfigMap[config.id],
        ...config,
        id: config.id,
      };
    }
    return {
      ...config,
      id: config.id,
    };
  });
