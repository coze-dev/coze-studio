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

import { useEffect } from 'react';

import { isEqual } from 'lodash-es';
import { produce } from 'immer';

import { getIsStructOutput } from '../utils';
import type { FeishuBaseConfigFe } from '../../types';
import { type ConfigStore } from '../../store';
import { mutateOutputStruct } from './output-struct';

export const useSubscribeAndUpdateConfig = (store: ConfigStore) => {
  useEffect(() => {
    const unsub = store.subscribe((state, prevState) => {
      const curConfig = state.config;
      const preConfig = prevState.config;
      const updatedConfig = produce<FeishuBaseConfigFe | null>(cfg =>
        mutateFieldsInteraction(cfg, preConfig),
      )(curConfig);
      if (!updatedConfig || isEqual(curConfig, updatedConfig)) {
        return;
      }
      state.setConfig(updatedConfig);
    });
    return unsub;
  }, []);
};

const mutateFieldsInteraction = (
  config: FeishuBaseConfigFe | null,
  preConfig: FeishuBaseConfigFe | null,
) => {
  if (!config) {
    return;
  }
  if (!getIsStructOutput(config.output_type)) {
    return;
  }
  if (isEqual(config, preConfig)) {
    return;
  }
  mutateOutputStruct(
    config.output_sub_component,
    preConfig?.output_sub_component,
  );
};
