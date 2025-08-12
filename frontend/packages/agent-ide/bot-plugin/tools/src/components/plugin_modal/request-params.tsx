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

/* eslint-disable @coze-arch/max-line-per-function */
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

import { cloneDeep } from 'lodash-es';
import classNames from 'classnames';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { UIButton, Toast, Table } from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import {
  type APIParameter,
  type UpdateAPIRequest,
  type PluginAPIInfo,
  type UpdateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import {
  initParamsDefault,
  defaultNode,
  maxDeep,
  scrollToBottom,
  scrollToErrorElement,
  sleep,
} from './utils';
import { ERROR_CODE, type RenderEnhancedComponentProps } from './types';
import { getColumns } from './params-components';
import { ROWKEY, childrenRecordName } from './config';

import s from './index.module.less';

const STARTNUM = 4;
const CHANGENUM = 13;
const SMALLGAP = 19;
const MAXZGAP = 40;
const TIMER = 100;

export interface UseRequestParamsProps {
  pluginId: string;
  apiId?: string;
  requestParams: Array<APIParameter> | undefined;
  step?: number;
  disabled: boolean;
  showSecurityCheckFailedMsg?: boolean;
  setShowSecurityCheckFailedMsg?: Dispatch<SetStateAction<boolean>>;
  editVersion?: number;
  functionName?: string;
  apiInfo?: PluginAPIInfo;
  spaceID: string;
  onSuccess?: (params: UpdateAPIResponse) => void;
  renderEnhancedComponent?: RenderEnhancedComponentProps['renderParamsComponent'];
}

export interface UseRequestParamsReturnValue {
  submitRequestParams: () => Promise<boolean>;
  requestParamsNode: JSX.Element;
  nlTool?: ReactNode;
}

export const useRequestParams = ({
  apiInfo,
  pluginId,
  apiId,
  requestParams,
  disabled,
  showSecurityCheckFailedMsg,
  setShowSecurityCheckFailedMsg,
  editVersion,
  functionName,
  spaceID,
  onSuccess,
  renderEnhancedComponent,
}: UseRequestParamsProps): UseRequestParamsReturnValue => {
  const [data, setFormData] = useState<Array<APIParameter>>(
    requestParams ? requestParams : [],
  );

  // @ts-expect-error -- linter-disable-autofix
  const setData = (formData, checkDefault = true) => {
    let fd = formData;
    if (checkDefault) {
      fd = initParamsDefault(formData, 'global_default');
    }
    setFormData(fd);
  };
  const [flag, setFlag] = useState<boolean>(false); // To update the view
  const [checkFlag, setCheckFlag] = useState<number>(0); // global validation
  const columns = getColumns({
    data,
    flag,
    checkFlag,
    setCheckFlag,
    setFlag,
    setData,
    disabled,
    // @ts-expect-error -- linter-disable-autofix
    showSecurityCheckFailedMsg,
    // @ts-expect-error -- linter-disable-autofix
    setShowSecurityCheckFailedMsg,
    enableFileType: true,
  });
  useEffect(() => {
    if (
      Array.isArray(requestParams) &&
      requestParams.length === 0 &&
      Array.isArray(data) &&
      data.length === 0
    ) {
      return;
    }
    setData(requestParams ? requestParams : []);
  }, [disabled, requestParams]);
  const submitRequestParams = async () => {
    setCheckFlag(checkFlag + 1);
    const sleepTime = 100;
    await sleep(sleepTime);
    if (!apiId || document.getElementsByClassName('errorClassTag').length > 0) {
      scrollToErrorElement('.errorClassTag');
      Toast.error({
        content: I18n.t('tool_new_S2_feedback_failed'),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
      return false;
    }
    try {
      const params: UpdateAPIRequest = {
        plugin_id: pluginId,
        api_id: apiId,
        request_params: data,
        edit_version: editVersion,
        function_name: functionName,
      };
      const resData = await PluginDevelopApi.UpdateAPI(params, {
        __disableErrorToast: true,
      });
      onSuccess?.(resData);
      return true;
    } catch (error) {
      // @ts-expect-error -- linter-disable-autofix
      const { code, msg } = error;
      if (Number(code) === ERROR_CODE.SAFE_CHECK) {
        setShowSecurityCheckFailedMsg?.(true);
      } else {
        Toast.error({
          content: withSlardarIdButton(msg),
        });
      }
      return false;
    }
  };
  const addParams = () => {
    setCheckFlag(0);
    const cloneData = cloneDeep(data);
    cloneData.push(defaultNode());
    setData(cloneData);
    setTimeout(() => {
      scrollToBottom(document.getElementsByClassName('semi-table-body')[0]);
    }, TIMER);
  };
  const maxNum = maxDeep(data);

  return {
    submitRequestParams,
    requestParamsNode: (
      <div>
        <div
          className={s['table-wrapper']}
          style={{ minWidth: 1008, overflowY: 'auto' }}
        >
          <Table
            // Minimum width, in order to be compatible with multi-level scenarios, the maximum level can support more than 50 layers
            // Minimum width = minimum width of module + (current level number - width change starting level) * (current level number < width change starting level? small interval number: large interval number)
            style={{
              minWidth: `calc(1008px + ${
                (maxNum - STARTNUM) * (maxNum < CHANGENUM ? SMALLGAP : MAXZGAP)
              }px)`,
            }} // From the 4th layer, add 19px to each additional layer.
            pagination={false}
            columns={columns}
            dataSource={data}
            rowKey={ROWKEY}
            childrenRecordName={childrenRecordName}
            expandAllRows={true}
            className={classNames(
              disabled ? s['request-params'] : s['request-params-edit'],
              s['table-style-list'],
            )}
            empty={<div></div>}
          />
          {!disabled && (
            <div
              style={
                Array.isArray(data) && data.length === 0 ? { borderTop: 0 } : {}
              }
              className={s['add-params-btn-wrap']}
            >
              <UIButton
                disabled={disabled}
                icon={<IconAdd />}
                style={{ marginTop: 12 }}
                type="tertiary"
                onClick={addParams}
              >
                {I18n.t('Create_newtool_s3_table_new')}
              </UIButton>
            </div>
          )}
        </div>
      </div>
    ),
    nlTool: renderEnhancedComponent?.({
      disabled: !data?.length || disabled,
      src: 'request',
      originParams: data,
      apiInfo,
      onSetParams: p => setFormData(p),
      spaceID,
      pluginId,
    }),
  };
};
