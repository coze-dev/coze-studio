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
import { useMemoizedFn } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
import { UIButton, Toast, UIModal, Table } from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import {
  PluginType,
  type APIParameter,
  type UpdateAPIRequest,
  type PluginAPIInfo,
  type UpdateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import {
  addDepthAndValue,
  defaultNode,
  sleep,
  maxDeep,
  scrollToErrorElement,
  scrollToBottom,
  initParamsDefault,
  doRemoveDefaultFromResponseParams,
} from './utils';
import {
  type RenderEnhancedComponentProps,
  type CheckParamsProps,
  ERROR_CODE,
  STATUS,
} from './types';
import { getColumns } from './params-components';
import { DebugParams } from './debug-components/debug-params';
import { ROWKEY, childrenRecordName } from './config';

import s from './index.module.less';

export interface UseRequestParamsProps {
  pluginId: string;
  apiId: string;
  requestParams: Array<APIParameter> | undefined;
  responseParams: Array<APIParameter> | undefined;
  step?: number;
  disabled: boolean;
  showSecurityCheckFailedMsg?: boolean;
  setShowSecurityCheckFailedMsg?: Dispatch<SetStateAction<boolean>>;
  editVersion?: number;
  pluginType?: PluginType;
  functionName?: string;
  apiInfo?: PluginAPIInfo;
  spaceID: string;
  onSuccess?: (params: UpdateAPIResponse) => void;
  renderEnhancedComponent?: RenderEnhancedComponentProps['renderParamsComponent'];
}

export interface UseRequestParamsReturnValue {
  submitResponseParams: () => Promise<boolean>;
  responseParamsNode: JSX.Element;
  extra?: ReactNode;
}

const SLEEP_TIME = 100;
const TIMER = 100;

export const useResponseParams = ({
  apiInfo,
  pluginId,
  requestParams,
  responseParams,
  apiId,
  disabled,
  showSecurityCheckFailedMsg,
  setShowSecurityCheckFailedMsg,
  editVersion,
  pluginType,
  functionName,
  spaceID,
  onSuccess,
  renderEnhancedComponent,
}: UseRequestParamsProps): UseRequestParamsReturnValue => {
  const [data, setFormData] = useState<Array<APIParameter>>(
    responseParams || [],
  );
  const [flag, setFlag] = useState<boolean>(false); // To update the view
  const [checkFlag, setCheckFlag] = useState<number>(0); // global validation
  const [inputModal, setInputModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const setData = useMemoizedFn((formData, checkDefault = true) => {
    let fd = formData;
    if (checkDefault) {
      fd = initParamsDefault(formData, 'global_default');
    }
    setFormData(fd);
  });

  useEffect(() => {
    if (
      Array.isArray(responseParams) &&
      responseParams.length === 0 &&
      Array.isArray(data) &&
      data.length === 0
    ) {
      return;
    }
    setData(responseParams || []);
  }, [disabled, responseParams]);
  const columns = getColumns({
    data,
    flag,
    checkFlag,
    setCheckFlag,
    setFlag,
    setData,
    isResponse: true,
    disabled,
    // @ts-expect-error -- linter-disable-autofix
    showSecurityCheckFailedMsg,
    // @ts-expect-error -- linter-disable-autofix
    setShowSecurityCheckFailedMsg,
    enableFileType: true,
  });

  const submitResponseParams = async () => {
    setCheckFlag(checkFlag + 1);
    await sleep(SLEEP_TIME);
    if (!apiId || document.getElementsByClassName('errorClassTag').length > 0) {
      scrollToErrorElement('.errorClassTag');
      Toast.error({
        content: withSlardarIdButton(I18n.t('tool_new_S2_feedback_failed')),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
      return false;
    }
    if (!apiId) {
      return false;
    }
    try {
      const params: UpdateAPIRequest = {
        plugin_id: pluginId,
        api_id: apiId,
        response_params: doRemoveDefaultFromResponseParams(data, false),
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
  const handleAction = ({
    response_params,
    status,
    failReason,
  }: CheckParamsProps) => {
    if (status === STATUS.PASS && response_params) {
      addDepthAndValue(response_params);
      setData(response_params);
      Toast.success({
        content: I18n.t('plugin_s3_success'),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
    } else {
      Toast.error({
        content: withSlardarIdButton(failReason ?? I18n.t('plugin_s3_failed')),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
    }
    setInputModal(false);
  };

  const handleActionNoParams = async () => {
    try {
      setLoading(true);
      const resData = await PluginDevelopApi.DebugAPI({
        plugin_id: pluginId,
        api_id: apiId,
        parameters: JSON.stringify({}),
        operation: 2,
      });
      if (resData?.success && resData?.response_params) {
        setData(resData.response_params);
        Toast.success({
          content: I18n.t('plugin_s3_success'),
          duration: 3,
          theme: 'light',
          showClose: false,
        });
      } else {
        Toast.error({
          content: withSlardarIdButton(
            resData?.reason ?? I18n.t('plugin_s3_failed'),
          ),
          duration: 3,
          theme: 'light',
          showClose: false,
        });
      }
    } catch (error) {
      Toast.error({
        content: withSlardarIdButton(I18n.t('plugin_s3_failed')),
        duration: 3,
        theme: 'light',
        showClose: false,
      });
      logger.persist.error({
        message: 'Custom Error: debug api failed',
        // @ts-expect-error -- linter-disable-autofix
        error,
      });
    }
    setLoading(false);
  };
  const addParams = () => {
    setCheckFlag(0);
    const cloneData = cloneDeep(data);
    cloneData.push(defaultNode());
    setData(cloneData);
    setFlag(!flag);
    setTimeout(() => {
      scrollToBottom(document.getElementsByClassName('semi-table-body')[0]);
    }, TIMER);
  };

  const maxNum = maxDeep(data);

  return {
    submitResponseParams,
    responseParamsNode: (
      <div>
        <div
          className={s['table-wrapper']}
          style={{ minWidth: 1008, overflowY: 'auto' }}
        >
          <Table
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- ui
            style={{ minWidth: `calc(1008px + ${(maxNum - 6) * 20}px)` }} // From the 6th layer, add 20px to each additional layer.
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
              className={s['add-params-btn-wrap']}
              style={
                Array.isArray(data) && data.length === 0 ? { borderTop: 0 } : {}
              }
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
        <UIModal
          visible={inputModal}
          title={I18n.t('plugin_s3_Parse')}
          className={s['input-modal']}
          keepDOM={false}
          footer={<></>}
          width={800}
          maskClosable={false}
          onCancel={() => setInputModal(false)}
        >
          <DebugParams
            disabled={disabled}
            pluginId={pluginId}
            apiId={apiId}
            requestParams={requestParams}
            operation={2}
            btnText={I18n.t('Create_newtool_s3_button_auto')}
            callback={handleAction}
          />
        </UIModal>
      </div>
    ),
    extra: (
      <>
        {renderEnhancedComponent?.({
          disabled: !data?.length || disabled,
          src: 'response',
          originParams: data,
          apiInfo,
          onSetParams: p => setData(p),
          spaceID,
          pluginId,
        })}
        <Button
          disabled={disabled || pluginType === PluginType.LOCAL}
          className="!mr-2"
          color="primary"
          loading={loading}
          onClick={e => {
            e.stopPropagation();
            if (Array.isArray(requestParams) && requestParams.length > 0) {
              setInputModal(true);
            } else {
              handleActionNoParams();
            }
          }}
        >
          {loading
            ? I18n.t('plugin_s3_Parsing')
            : I18n.t('Create_newtool_s3_button_auto')}
        </Button>
      </>
    ),
  };
};
