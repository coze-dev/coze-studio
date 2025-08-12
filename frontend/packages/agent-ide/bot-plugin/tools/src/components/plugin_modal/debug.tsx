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

import { I18n } from '@coze-arch/i18n';
import { UITag, Typography, Space, Col, Row } from '@coze-arch/bot-semi';
import {
  type DebugExample,
  type PluginType,
  type PluginAPIInfo,
} from '@coze-arch/bot-api/plugin_develop';

import { type CheckParamsProps, STATUS } from './types';
import { DebugParams } from './debug-components/debug-params';
import { DebugCheck } from './debug-components/debug-check';

import s from './index.module.less';

const { Text } = Typography;

// @ts-expect-error -- linter-disable-autofix
const getApiTitle = (pluginName, name, labelKey) => (
  <Text
    className={s['card-title']}
    ellipsis={{
      showTooltip: {
        opts: {
          content: `${pluginName}.${name}`,
          style: { wordBreak: 'break-word' },
        },
      },
    }}
  >
    {pluginName}.{name} {I18n.t(labelKey)}
  </Text>
);

export const Debug: React.FC<{
  pluginType?: PluginType;
  disabled: boolean;
  apiInfo: PluginAPIInfo;
  pluginId: string;
  apiId: string;
  pluginName: string;
  debugExample?: DebugExample;
  setDebugStatus?: (status: STATUS | undefined) => void;
  setDebugExample?: (v: DebugExample) => void;
  isViewExample?: boolean; // Look at the example mode, the title is different
  onSuccessCallback?: () => void;
}> = ({
  disabled,
  apiInfo,
  pluginId,
  apiId,
  pluginName,
  setDebugStatus,
  debugExample,
  setDebugExample,
  isViewExample = false,
  pluginType,
  onSuccessCallback,
}) => {
  const [checkParams, setCheckParams] = useState<CheckParamsProps>({});
  const [status, setStatus] = useState<STATUS | undefined>();
  const handleAction = ({
    status: innerStatus,
    request,
    response,
    failReason,
    rawResp,
  }: CheckParamsProps) => {
    setStatus(innerStatus);
    setCheckParams({
      status: innerStatus,
      request,
      response,
      failReason,
      rawResp,
    });
    setDebugStatus?.(innerStatus);
    innerStatus === STATUS.PASS &&
      setDebugExample?.({ req_example: request, resp_example: response });
    // Callback after successful debugging
    innerStatus === STATUS.PASS && onSuccessCallback?.();
  };

  useEffect(() => {
    if (debugExample) {
      setCheckParams({
        ...checkParams,
        request: debugExample?.req_example,
        response: debugExample?.resp_example,
        failReason: '',
      });
    } else {
      setCheckParams({});
    }
  }, [debugExample]);

  return (
    <div
      className={s['debug-check']}
      data-testid="plugin.tool.debug-modal-content"
    >
      <Row gutter={16}>
        <Col span={12}>
          <div className={s['main-container']}>
            <div className={s['card-header']}>
              {isViewExample ? (
                <Text className={s['card-title']}>
                  {I18n.t('Create_newtool_s4_title')}
                </Text>
              ) : (
                getApiTitle(pluginName, apiInfo.name, 'Create_newtool_s4_title')
              )}
            </div>
            <div
              style={{
                maxHeight: isViewExample ? 'calc(100% - 55px)' : 542,
                display: 'flex',
              }}
            >
              <DebugParams
                pluginType={pluginType}
                disabled={disabled}
                pluginId={pluginId}
                apiId={apiId}
                requestParams={apiInfo?.request_params}
                callback={handleAction}
                debugExampleStatus={apiInfo?.debug_example_status}
                showExampleTag={!isViewExample}
              />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className={s['main-container']}>
            <div className={s['card-header']}>
              <Space style={{ width: '100%' }}>
                {isViewExample ? (
                  <Text className={s['card-title']}>
                    {I18n.t('plugin_edit_tool_test_run_debugging_example')}
                  </Text>
                ) : (
                  getApiTitle(
                    pluginName,
                    apiInfo.name,
                    'Create_newtool_s4_result',
                  )
                )}
                {status === STATUS.PASS && (
                  <UITag color="green">{I18n.t('plugin_s4_debug_pass')}</UITag>
                )}
                {status === STATUS.FAIL && (
                  <UITag color="red">{I18n.t('plugin_s4_debug_failed')}</UITag>
                )}
              </Space>
            </div>
            <div
              className={s['card-debug-check']}
              style={{
                height: isViewExample ? '100%' : 542,
              }}
            >
              <DebugCheck checkParams={checkParams} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
