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

import { useEffect, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import {
  type PluginAPIInfo,
  DebugExampleStatus,
} from '@coze-arch/bot-api/plugin_develop';
import { usePluginStore } from '@coze-studio/bot-plugin-store';

import { addDepthAndValue } from '../../components/plugin_modal/utils';
import { ExampleModal } from '../../components/example-modal';
import { setEditToolExampleValue } from './utils';

// @ts-expect-error -- linter-disable-autofix
export const useEditExample = ({ onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>();

  const { pluginInfo } = usePluginStore(store => ({
    pluginInfo: store.pluginInfo,
  }));

  const openExample = (info: PluginAPIInfo) => {
    setVisible(true);

    if (
      info?.debug_example?.req_example &&
      info?.debug_example_status === DebugExampleStatus.Enable
    ) {
      const requestParams = cloneDeep(info?.request_params ?? []);
      setEditToolExampleValue(
        requestParams,
        JSON.parse(info?.debug_example?.req_example),
      );
      addDepthAndValue(requestParams);
      setApiInfo({ ...info, request_params: requestParams });
    } else {
      addDepthAndValue(info.request_params);
      setApiInfo(info);
    }
  };

  const closeExample = () => {
    setVisible(false);
  };
  const onSave = () => {
    onUpdate?.();
    closeExample();
  };
  useEffect(() => {
    if (!visible) {
      setApiInfo(undefined);
    }
  }, [visible]);
  return {
    exampleNode: (
      <ExampleModal
        visible={visible}
        onCancel={closeExample}
        pluginId={pluginInfo?.plugin_id ?? ''}
        apiInfo={apiInfo as PluginAPIInfo}
        pluginName={pluginInfo?.meta_info?.name ?? ''}
        onSave={onSave}
      />
    ),
    openExample,
  };
};
