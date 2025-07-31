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
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useMemoizedFn } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { I18n } from '@coze-arch/i18n';
import { UIFormTextArea, Toast, Form } from '@coze-arch/bot-semi';
import {
  APIMethod,
  PluginType,
  type UpdateAPIResponse,
  type CreateAPIRequest,
  type CreateAPIResponse,
} from '@coze-arch/bot-api/plugin_develop';
import { PluginDevelopApi } from '@coze-arch/bot-api';

import { ERROR_CODE, type RenderEnhancedComponentProps } from './types';

import s from './index.module.less';

export interface UseBaseInfoRequest {
  space_id: string;
  pluginId: string;
  apiId?: string;
  baseInfo?: {
    name?: string;
    desc?: string;
  };
  setApiId?: (id: string) => void;
  showSecurityCheckFailedMsg?: boolean;
  setShowSecurityCheckFailedMsg?: Dispatch<SetStateAction<boolean>>;
  showModal: boolean;
  disabled: boolean;
  editVersion?: number;
  showFunctionName?: boolean;
  pluginType?: PluginType;
  onSuccess?: (params: UpdateAPIResponse | CreateAPIResponse) => void;
  renderEnhancedComponent?: RenderEnhancedComponentProps['renderDescComponent'];
}

export interface UseBaseInfoReturnValue {
  submitBaseInfo: () => Promise<boolean>;
  baseInfoNode: JSX.Element;
}

const ENTER_KEY_CODE = 13;

export const useBaseInfo = ({
  space_id,
  pluginId,
  apiId = '',
  baseInfo = {},
  setApiId,
  showModal,
  disabled,
  showSecurityCheckFailedMsg,
  setShowSecurityCheckFailedMsg,
  editVersion,
  showFunctionName = false,
  pluginType,
  onSuccess,
  renderEnhancedComponent,
}: UseBaseInfoRequest): UseBaseInfoReturnValue => {
  const formRef = useRef<Form>(null);
  const [originDesc, setOriginDesc] = useState<string | undefined>(undefined);
  useEffect(() => {
    setOriginDesc(baseInfo?.desc);
    formRef.current?.formApi.setValues({
      name: baseInfo.name,
      desc: baseInfo.desc,
    });
  }, [baseInfo.name, baseInfo.desc, showModal, disabled]);
  const doSetDesc = useMemoizedFn((desc: string) => {
    formRef.current?.formApi.setValue('desc', desc);
  });

  // Submit basic information
  const submitBaseInfo = async () => {
    const status = await formRef.current?.formApi
      .validate()
      .then(() => true)
      .catch(() => false);
    if (!status) {
      return false;
    }

    let baseResData;
    const formValues = formRef.current?.formApi.getValues();
    const params: CreateAPIRequest = {
      plugin_id: pluginId,
      name: formValues.name,
      desc: formValues.desc,
      edit_version: editVersion,
      function_name: formValues.function_name,
    };
    try {
      if (apiId) {
        baseResData = await PluginDevelopApi.UpdateAPI(
          {
            ...params,
            api_id: apiId,
          },
          {
            __disableErrorToast: true,
          },
        );
      } else {
        baseResData = await PluginDevelopApi.CreateAPI(
          {
            ...params,
            method: APIMethod.POST,
            path: `/${params.name}`,
          },
          {
            __disableErrorToast: true,
          },
        );
        setApiId?.((baseResData as CreateAPIResponse).api_id || '');
      }
      onSuccess?.(baseResData);
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

  const changeVal = () => {
    if (showSecurityCheckFailedMsg) {
      setShowSecurityCheckFailedMsg?.(false);
    }
  };

  return {
    submitBaseInfo,
    baseInfoNode: (
      <>
        <Form<Record<string, unknown>>
          showValidateIcon={false}
          ref={formRef}
          disabled={disabled}
          className={s['base-info-form']}
        >
          {() =>
            disabled ? (
              <>
                <Form.Slot
                  label={{
                    text: I18n.t('Create_newtool_s1_name'),
                    required: true,
                  }}
                >
                  {baseInfo.name}
                </Form.Slot>
                <Form.Slot
                  label={{
                    text: I18n.t('Create_newtool_s1_dercribe'),
                    required: true,
                  }}
                >
                  {baseInfo.desc}
                </Form.Slot>
              </>
            ) : (
              <>
                <UIFormTextArea
                  data-testid="plugin-create-tool-base-info-name"
                  className={s['textarea-single-line']}
                  field="name"
                  label={I18n.t('Create_newtool_s1_name')}
                  placeholder={I18n.t('Create_newtool_s1_title_empty')}
                  trigger={['blur', 'change']}
                  maxCount={30}
                  maxLength={30}
                  rows={1}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onKeyDown={(ele: any) => {
                    const e = window.event || ele;
                    if (
                      e.key === 'Enter' ||
                      e.code === 'Enter' ||
                      e.keyCode === ENTER_KEY_CODE
                    ) {
                      e.returnValue = false;
                      return false;
                    }
                  }}
                  onChange={changeVal}
                  rules={[
                    {
                      required: true,
                      message: I18n.t('Create_newtool_s1_title_empty'),
                    },
                    {
                      pattern: /^[a-zA-Z0-9_]+$/,
                      message: I18n.t('Create_newtool_s1_title_error1'),
                    },
                  ]}
                />
                <div className="relative">
                  {renderEnhancedComponent?.({
                    disabled: !originDesc,
                    originDesc,
                    className: 'absolute right-[0] top-[12px]',
                    plugin_id: pluginId,
                    space_id,
                    onSetDescription: doSetDesc,
                  })}
                  <UIFormTextArea
                    data-testid="plugin-create-tool-base-info-desc"
                    field="desc"
                    label={I18n.t('Create_newtool_s1_dercribe')}
                    placeholder={I18n.t('Create_newtool_s1_dercribe_error')}
                    rows={2}
                    trigger={['blur', 'change']}
                    maxCount={600}
                    maxLength={600}
                    rules={[
                      {
                        required: true,
                        message: I18n.t('Create_newtool_s1_dercribe_empty'),
                      },
                      IS_OVERSEA && {
                        // eslint-disable-next-line no-control-regex
                        pattern: /^[\x00-\x7F]+$/,
                        message: I18n.t('create_plugin_modal_descrip_error'),
                      },
                    ]}
                    // @ts-expect-error -- linter-disable-autofix
                    onChange={v => {
                      changeVal();
                      setOriginDesc(v);
                    }}
                  />
                  {showFunctionName && pluginType === PluginType.LOCAL ? (
                    <UIFormTextArea
                      className={s['textarea-single-line']}
                      field="function_name"
                      label={I18n.t('create_local_plugin_basic_tool_function')}
                      placeholder={I18n.t(
                        'create_local_plugin_basic_tool_function_input_placeholder',
                      )}
                      rows={1}
                      trigger={['blur', 'change']}
                      maxCount={30}
                      maxLength={30}
                      rules={[
                        {
                          required: true,
                          message: I18n.t(
                            'create_local_plugin_basic_warning_no_tool_function_entered',
                          ),
                        },
                      ]}
                      onChange={changeVal}
                    />
                  ) : null}
                </div>
              </>
            )
          }
        </Form>
      </>
    ),
  };
};
