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
  // console.log('call mutateFieldsInteraction');
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
