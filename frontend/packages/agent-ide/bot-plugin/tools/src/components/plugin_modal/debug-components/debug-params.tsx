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

import React, { useMemo, useRef, useState } from 'react';

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { UIButton, Toast } from '@coze-arch/bot-semi';
import {
  DebugExampleStatus,
  PluginType,
  type APIParameter,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import {
  transformTreeToObj,
  sleep,
  scrollToErrorElement,
  transformParamsToTree,
} from '../utils';
import { type CheckParamsProps, STATUS } from '../types';
import s from '../index.module.less';
import ParamsForm from './params-form';

/** Stringify indent */
const INDENTATION_SPACES = 2;
const SLEEP_NUM = 100;

export const DebugParams: React.FC<{
  requestParams: APIParameter[] | undefined;
  pluginId: string;
  apiId: string;
  operation?: number;
  btnText?: string;
  callback?: (val: CheckParamsProps) => void;
  disabled: boolean;
  debugExampleStatus?: DebugExampleStatus;
  showExampleTag?: boolean;
  pluginType?: PluginType;
}> = ({
  requestParams = [],
  pluginId,
  apiId,
  operation = 1,
  btnText = I18n.t('Create_newtool_s4_run'),
  callback,
  disabled,
  debugExampleStatus = DebugExampleStatus.Default,
  showExampleTag = false,
  pluginType,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [check, setCheck] = useState<number>(0);
  const paramsFormRef = useRef<{ data: Array<APIParameter> }>(null);

  const handleAction = async () => {
    // Verification is required
    setCheck(check + 1);
    await sleep(SLEEP_NUM);
    const errorEle = document.getElementsByClassName('errorDebugClassTag');
    if (!apiId || errorEle.length > 0) {
      scrollToErrorElement('.errorDebugClassTag');
      Toast.error({
        content: withSlardarIdButton(I18n.t('tool_new_S2_feedback_failed')),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
      return false;
    }

    let reqParams = {};
    setLoading(true);
    if (
      Array.isArray(paramsFormRef.current?.data) &&
      (paramsFormRef.current?.data || []).length > 0
    ) {
      reqParams = transformTreeToObj(paramsFormRef.current?.data);
    }
    try {
      const resData = await PluginDevelopApi.DebugAPI({
        plugin_id: pluginId,
        api_id: apiId,
        parameters: JSON.stringify(reqParams),
        operation,
      });

      callback?.({
        status: resData.success ? STATUS.PASS : STATUS.FAIL,
        request: resData.raw_req,
        response: resData.resp,
        failReason: resData.reason,
        response_params: resData.response_params,
        rawResp: resData.raw_resp,
      });
    } catch (e) {
      callback?.({
        status: STATUS.FAIL,
        request: JSON.stringify(reqParams, null, INDENTATION_SPACES),
        response: I18n.t('plugin_exception'),
        failReason: I18n.t('plugin_exception'),
      });
    }
    setLoading(false);
  };
  const requestParamsData = useMemo(
    () => transformParamsToTree(requestParams),
    [requestParams],
  );
  return (
    <div className={s['debug-params-box']}>
      <ParamsForm
        height={443}
        ref={paramsFormRef}
        requestParams={requestParamsData}
        defaultKey="global_default"
        disabled={disabled}
        check={check}
        debugExampleStatus={debugExampleStatus}
        showExampleTag={showExampleTag}
        supportFileTypeUpload
      />
      {!disabled && (
        <div className={s.runbtn}>
          <UIButton
            disabled={disabled || pluginType === PluginType.LOCAL}
            style={{ width: 98 }}
            loading={loading}
            // theme="solid"
            type="tertiary"
            onClick={handleAction}
          >
            {btnText === I18n.t('Create_newtool_s3_button_auto') &&
              (loading
                ? I18n.t('plugin_s3_Parsing')
                : I18n.t('Create_newtool_s3_button_auto'))}
            {btnText === I18n.t('Create_newtool_s4_run') &&
              (loading
                ? I18n.t('plugin_s3_running')
                : I18n.t('Create_newtool_s4_run'))}
          </UIButton>
        </div>
      )}
    </div>
  );
};
