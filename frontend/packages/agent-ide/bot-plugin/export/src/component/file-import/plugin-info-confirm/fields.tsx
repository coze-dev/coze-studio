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

import { cloneDeep } from 'lodash-es';
import { InputWithCountField } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { safeJSONParse } from '@coze-arch/bot-utils';
import {
  Col,
  Form,
  Row,
  UICascader,
  UIFormInput,
  UIFormTextArea,
  UIIconButton,
  UIInput,
  useFormApi,
  withField,
} from '@coze-arch/bot-semi';
import { type commonParamSchema } from '@coze-arch/bot-api/developer_api';
import {
  type OauthTccOpt,
  authOptionsPlaceholder,
  extInfoText,
  locationOption,
} from '@coze-studio/plugin-shared';
import { IconAdd, IconDeleteOutline } from '@coze-arch/bot-icons';
import { InfoPopover } from '@coze-agent-ide/bot-plugin-tools/infoPopover';

import { type AuthOption, findAuthTypeItem, formRuleList } from './utils';
import { type ConfirmFormProps } from './interface';

import s from './index.module.less';

interface PluginInfoFormFieldProps {
  disabled?: boolean;
}

const HEADER_LIST_LENGTH_MAX = 20;

export const PluginNameField = ({ disabled }: PluginInfoFormFieldProps) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();
  return disabled ? (
    <Form.Slot
      label={{
        text: I18n.t('create_plugin_modal_name1'),
        required: true,
      }}
    >
      <div>{formValues?.name}</div>
    </Form.Slot>
  ) : (
    <UIFormTextArea
      field="name"
      className={s['textarea-single-line']}
      label={I18n.t('create_plugin_modal_name1')}
      placeholder={I18n.t('create_plugin_modal_name2')}
      trigger={['blur', 'change']}
      maxCount={30}
      maxLength={30}
      rows={1}
      onBlur={() => {
        formApi.setValue('name', formApi.getValue('name')?.trim());
      }}
      rules={formRuleList.name}
    />
  );
};

export const PluginDescField = ({ disabled }: PluginInfoFormFieldProps) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();

  return disabled ? (
    <Form.Slot
      label={{
        text: I18n.t('create_plugin_modal_descrip1'),
        required: true,
      }}
    >
      <div>{formValues?.desc}</div>
    </Form.Slot>
  ) : (
    <UIFormTextArea
      field="desc"
      label={I18n.t('create_plugin_modal_descrip1')}
      trigger={['blur', 'change']}
      placeholder={I18n.t('create_plugin_modal_descrip2')}
      rows={2}
      maxCount={600}
      maxLength={600}
      onBlur={() => {
        formApi.setValue('desc', formValues?.desc?.trim());
      }}
      rules={formRuleList.desc}
    />
  );
};

export const PluginUrlField = ({ disabled }: PluginInfoFormFieldProps) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();
  return disabled ? (
    <Form.Slot
      label={{
        text: I18n.t('create_plugin_modal_url1'),
        required: true,
      }}
    >
      <div>{formValues?.url}</div>
    </Form.Slot>
  ) : (
    <UIFormInput
      className={s['textarea-single-line']}
      trigger={['blur', 'change']}
      field="url"
      label={I18n.t('create_plugin_modal_url1')}
      placeholder={I18n.t('create_plugin_modal_url2')}
      onBlur={() => {
        formApi.setValue('url', formValues?.url?.trim());
      }}
      rules={formRuleList.url}
    />
  );
};

const HeaderList = ({
  disabled,
  value: headerList = [],
  onChange: setHeaderList,
}: PluginInfoFormFieldProps & {
  value?: commonParamSchema[];
  onChange?: (val?: commonParamSchema[]) => void;
}) => {
  /** Add header */
  // @ts-expect-error -- linter-disable-autofix
  const addHeader = data => {
    const h = [...headerList];
    h.push(data.name ? data : { name: '', value: '' });
    setHeaderList?.(h);
  };
  /** Delete header */
  // @ts-expect-error -- linter-disable-autofix
  const deleteHeader = index => {
    // If it is the last header, only empty the content, not delete it
    const filterList = cloneDeep(headerList);
    filterList.splice(index, 1);
    setHeaderList?.(filterList);
  };

  return (
    <Form.Slot
      className={s['header-list']}
      label={{
        text: I18n.t('plugin_create_header_list_title'),
        align: 'right',
        extra: (
          <div className={s['header-list-extra']}>
            <InfoPopover data={extInfoText.header_list} />
            {headerList.length < HEADER_LIST_LENGTH_MAX && !disabled && (
              <UIIconButton
                size="large"
                icon={<IconAdd />}
                onClick={addHeader}
              />
            )}
          </div>
        ),
      }}
    >
      <div className={s['herder-list-box']}>
        <Row className={s['header-row']} gutter={8}>
          <Col span={9}>
            <div className={s['header-col-content']}>Key</div>
          </Col>
          <Col span={12}>
            <div className={s['header-col-content']}>Value</div>
          </Col>
          <Col span={3}>
            <div
              className={s['header-col-content']}
              style={{ textAlign: 'right' }}
            >
              {I18n.t('plugin_create_action_btn')}
            </div>
          </Col>
        </Row>

        <div className={s['herder-list-cotent']}>
          {headerList?.map((item, index) => (
            <Row
              gutter={8}
              type="flex"
              justify="space-between"
              align="middle"
              key={index}
            >
              <Col span={9}>
                <div className={s['col-content']}>
                  <UIInput
                    placeholder={'Name'}
                    value={item.name}
                    onChange={val => {
                      const list = cloneDeep(headerList);
                      list[index].name = val;
                      setHeaderList?.(list);
                    }}
                    maxLength={100}
                    disabled={disabled}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className={s['col-content']}>
                  <UIInput
                    placeholder={'Value'}
                    value={item.value}
                    onChange={val => {
                      const list = cloneDeep(headerList);
                      list[index].value = val;
                      setHeaderList?.(list);
                    }}
                    maxLength={200}
                    disabled={disabled}
                  />
                </div>
              </Col>
              <Col span={3}>
                <div className={s['col-content']}>
                  <UIIconButton
                    icon={<IconDeleteOutline />}
                    type="secondary"
                    disabled={disabled}
                    onClick={() => {
                      deleteHeader(index);
                    }}
                  />
                </div>
              </Col>
            </Row>
          ))}
        </div>
      </div>
    </Form.Slot>
  );
};

const HeaderListInnerField = withField(HeaderList, {
  valueKey: 'value',
  onKeyChangeFnName: 'onChange',
});

export const HeaderListField = (props: PluginInfoFormFieldProps) => (
  <HeaderListInnerField
    {...props}
    field="headerList"
    label={{ text: '' }}
  ></HeaderListInnerField>
);

export const AuthTypeField = ({
  disabled,
  authOption,
  onChange,
}: PluginInfoFormFieldProps & {
  authOption: Array<AuthOption>;
  onChange: (val?: Array<number>) => void;
}) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();
  return disabled ? (
    <Form.Slot
      label={{
        text: I18n.t('create_plugin_modal_auth1'),
        extra: <InfoPopover data={extInfoText.auth} />,
        required: true,
      }}
    >
      <div>
        {findAuthTypeItem(authOption, formValues?.auth_type?.at(-1))?.label}
      </div>
    </Form.Slot>
  ) : (
    <UICascader.FormItem
      rules={[{ required: true }]}
      style={{ width: '100%' }}
      initValue={formValues?.auth_type || [0]}
      field="auth_type"
      label={{
        text: I18n.t('create_plugin_modal_auth1'),
        extra: <InfoPopover data={extInfoText.auth} />,
      }}
      placeholder={I18n.t('please_select_an_authorization_method')}
      treeData={authOption}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      displayRender={(list: any) => `${(list as string[])?.at(-1)}`}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange={(val: any) => {
        onChange(val as Array<number>);
      }}
    />
  );
};

export const ServiceField = ({ disabled }: PluginInfoFormFieldProps) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();
  return (
    <>
      {disabled ? (
        <Form.Slot
          label={{
            text: I18n.t('create_plugin_modal_location'),
            extra: <InfoPopover data={extInfoText.location} />,
            required: true,
          }}
        >
          <div>
            {
              findAuthTypeItem(locationOption, formApi.getValues()?.location)
                ?.label
            }
          </div>
        </Form.Slot>
      ) : (
        <Form.RadioGroup
          rules={[{ required: true }]}
          field="location"
          label={{
            text: I18n.t('create_plugin_modal_location'),
            extra: <InfoPopover data={extInfoText.location} />,
          }}
          options={locationOption}
        />
      )}

      {disabled ? (
        <Form.Slot
          label={{
            text: I18n.t('create_plugin_modal_Parameter'),
            extra: <InfoPopover data={extInfoText.key} />,
            required: true,
          }}
        >
          <div>{formApi.getValues()?.key}</div>
        </Form.Slot>
      ) : (
        <InputWithCountField
          initValue={formValues?.key}
          trigger={['blur', 'change']}
          field="key"
          label={{
            text: I18n.t('create_plugin_modal_Parameter'),
            extra: <InfoPopover data={extInfoText.key} />,
          }}
          placeholder={I18n.t('create_plugin_modal_Parameter_empty')}
          maxLength={100}
          rules={formRuleList.key}
        />
      )}

      {disabled ? (
        <Form.Slot
          label={{
            text: I18n.t('create_plugin_modal_Servicetoken'),
            extra: <InfoPopover data={extInfoText.service_token} />,
            required: true,
          }}
        >
          <div>{formValues?.service_token}</div>
        </Form.Slot>
      ) : (
        <InputWithCountField
          initValue={formValues?.service_token}
          trigger={['blur', 'change']}
          field="service_token"
          label={{
            text: I18n.t('create_plugin_modal_Servicetoken'),
            extra: <InfoPopover data={extInfoText.service_token} />,
          }}
          placeholder={I18n.t('create_plugin_modal_Servicetoken_empty')}
          maxLength={400}
          rules={formRuleList.service_token}
        />
      )}
    </>
  );
};

// extItems dynamic delivery
export const ExtItems = ({
  disabled,
  extItems,
}: PluginInfoFormFieldProps & { extItems: OauthTccOpt[] }) => {
  const formApi = useFormApi<ConfirmFormProps>();
  const formValues = formApi.getValues();
  return (
    <>
      {/* Server level dynamic return authorization */}
      {extItems?.map(item => (
        <>
          {disabled ? (
            <Form.Slot
              key={item.key}
              label={{
                text: item.key,
                extra: extInfoText[item.key] && (
                  <InfoPopover data={extInfoText[item.key]} />
                ),
                required: item.required,
              }}
            >
              <div>
                {formValues?.oauth_info
                  ? safeJSONParse(formValues.oauth_info)[item.key]
                  : null}
              </div>
            </Form.Slot>
          ) : (
            <InputWithCountField
              key={item.key}
              trigger={['blur', 'change']}
              field={item.key}
              label={{
                text: item.key,
                extra: extInfoText[item.key] && (
                  <InfoPopover data={extInfoText[item.key]} />
                ),
              }}
              // @ts-expect-error -- linter-disable-autofix
              placeholder={authOptionsPlaceholder[item.key]}
              initValue={
                (formValues?.oauth_info &&
                  safeJSONParse(formValues.oauth_info)[item.key]) ||
                item.default
              }
              maxLength={item.max_len}
              rules={[
                {
                  required: item.required,
                  // @ts-expect-error -- linter-disable-autofix
                  message: authOptionsPlaceholder[item.key],
                },
                item.type === 'url'
                  ? {
                      pattern: /^(http|https):\/\/.+$/,
                      message: I18n.t('create_plugin_modal_URLerror'),
                    }
                  : {
                      // eslint-disable-next-line no-control-regex -- regex
                      pattern: /^[\x00-\x7F]+$/,
                      message: I18n.t('create_plugin_modal_descrip_error'),
                    },
              ]}
            />
          )}
        </>
      ))}
    </>
  );
};
