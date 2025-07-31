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

import { type CustomComponent } from '../types/plugin-component';
import { type PluginName } from '../constants/plugin-name';
import { usePluginList } from './use-plugin-list';

interface ComponentConfig<K extends keyof CustomComponent> {
  pluginName: PluginName;
  // eslint-disable-next-line @typescript-eslint/naming-convention -- as expected
  Component: CustomComponent[K];
}

export const usePluginCustomComponents = <K extends keyof CustomComponent>(
  componentKey: K,
) => {
  const pluginList = usePluginList();
  const pluginComponentsList = pluginList
    .map(_plugin => ({
      pluginName: _plugin.pluginName,
      Component: _plugin.customComponents?.[componentKey],
    }))
    .filter((componentConfig): componentConfig is ComponentConfig<K> =>
      Boolean(componentConfig.Component),
    );

  return pluginComponentsList;
};
