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

import { useEffect, useState, Suspense, lazy } from 'react';

import { cloneDeep } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';
import {
  type PluginParameter,
  type DebugExample,
  type PluginAPIInfo,
  DebugExampleStatus,
} from '@coze-arch/bot-api/plugin_develop';

import { addDepthAndValue } from '../../components/plugin_modal/utils';
import { setStoreExampleValue, setWorkflowExampleValue } from './utils';

const LazyDebug = lazy(async () => {
  const { Debug } = await import('../../components/plugin_modal/debug');
  return {
    default: Debug,
  };
});
interface ShowExampleParams {
  scene: 'workflow' | 'bot';
  requestParams: PluginParameter[];
  debugExample: DebugExample;
}

interface ViewExampleProps {
  getPopupContainer?: () => HTMLElement;
}

export const useViewExample = (props?: ViewExampleProps) => {
  const [visible, setVisible] = useState(false);
  const [apiInfo, setApiInfo] = useState<PluginAPIInfo>();

  const doShowExample = ({
    scene,
    requestParams,
    debugExample,
  }: ShowExampleParams) => {
    if (!requestParams || !debugExample?.req_example) {
      return;
    }
    const requestParamsData = cloneDeep(requestParams);
    if (scene === 'workflow') {
      setWorkflowExampleValue(
        requestParamsData,
        JSON.parse(debugExample?.req_example),
      );
    } else if (scene === 'bot') {
      setStoreExampleValue(
        requestParamsData,
        JSON.parse(debugExample?.req_example),
      );
    } else {
      return;
    }

    addDepthAndValue(requestParamsData);
    setApiInfo({
      debug_example_status: DebugExampleStatus.Enable,
      request_params:
        requestParamsData as unknown as PluginAPIInfo['request_params'],
      debug_example: debugExample,
    });
    setVisible(true);
  };

  const closeExample = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) {
      setApiInfo(undefined);
    }
  }, [visible]);
  return {
    exampleNode: (
      <UIModal
        title={I18n.t('plugin_edit_tool_test_run_example_tip')}
        visible={visible}
        width={1280}
        style={{ height: 'calc(100vh - 140px)', minWidth: '1040px' }}
        centered
        onCancel={closeExample}
        footer={null}
        getPopupContainer={props?.getPopupContainer}
      >
        {apiInfo ? (
          <Suspense fallback={null}>
            <LazyDebug
              disabled={true}
              pluginId={''}
              apiId={apiInfo?.api_id ?? ''}
              apiInfo={apiInfo as PluginAPIInfo}
              pluginName={''}
              debugExample={apiInfo?.debug_example}
              isViewExample={true}
            />
          </Suspense>
        ) : null}
      </UIModal>
    ),
    doShowExample,
  };
};
