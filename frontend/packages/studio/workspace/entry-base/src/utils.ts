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

import qs from 'qs';
import { pick } from 'lodash-es';
import { type PluginNavType } from '@coze-studio/bot-plugin-store/src/context';

/**
 * Compares two objects for equality, comparing only the specified key, implemented by JSON.stringify
 * @param obj1
 * @param obj2
 * @Param keys The key to compare
 * @Returns is equal
 */
export function compareObjects<T>(
  obj1: T,
  obj2: T,
  keys: (keyof T)[],
): boolean {
  const subset1 = pick(obj1, keys);
  const subset2 = pick(obj2, keys);
  return JSON.stringify(subset1) === JSON.stringify(subset2);
}

export function resourceNavigate(
  navBase: string,
  pluginID: string,
  navigate: Function,
): PluginNavType {
  return {
    // eslint-disable-next-line max-params
    toResource: (resource, rid, query, opts) =>
      rid
        ? navigate(`${navBase}/${resource}/${rid}?${qs.stringify(query)}`, opts)
        : '',
    tool: (toolID, query, opts) =>
      navigate(
        `${navBase}/plugin/${pluginID}/tool/${toolID}?${qs.stringify(query)}`,
        opts,
      ),
    mocksetList: (toolID, query, opts) =>
      navigate(
        `${navBase}/plugin/${pluginID}/tool/${toolID}/plugin-mock-set?${qs.stringify(
          query,
        )}`,
        opts,
      ),
    // eslint-disable-next-line max-params
    mocksetDetail: (toolID, mocksetID, query, opts) =>
      navigate(
        `${navBase}/plugin/${pluginID}/tool/${toolID}/plugin-mock-set/${mocksetID}?${qs.stringify(
          query,
        )}`,
        opts,
      ),
    cloudIDE: (query, opts) =>
      navigate(
        `${navBase}/plugin/${pluginID}/cloud-tool?${qs.stringify(query)}`,
        opts,
      ),
  };
}
