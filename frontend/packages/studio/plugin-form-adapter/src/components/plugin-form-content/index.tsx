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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

/* eslint-disable @coze-arch/max-line-per-function */
import { type FC, useEffect, useState, Fragment } from 'react';

import { useRequest } from 'ahooks';
import { useBenefitBasic, UserLevel } from '@coze-studio/premium-store-adapter';
import {
  CLOUD_PLUGIN_COZE,
  doGetCreationMethodTips,
  extInfoText,
  locationOption,
  authOptionsPlaceholder,
  grantTypeOptions,
  type PluginInfoProps,
} from '@coze-studio/plugin-shared';
import { useCurrentEnterpriseInfo } from '@coze-foundation/enterprise-store-adapter';
import { PictureUpload } from '@coze-common/biz-components/picture-upload';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import {
  Cascader,
  Col,
  Form,
  FormInput,
  FormSelect,
  FormTextArea,
  IconButton,
  Input,
  Row,
  Typography,
  withField,
} from '@coze-arch/coze-design';
import { safeJSONParse } from '@coze-arch/bot-utils';
import { useFlags } from '@coze-arch/bot-flags';
import {
  type PrivateLink,
  type commonParamSchema,
} from '@coze-arch/bot-api/plugin_develop';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, PluginDevelopApi } from '@coze-arch/bot-api';
import { InfoPopover } from '@coze-agent-ide/bot-plugin-tools/infoPopover';

import {
  findAuthTypeItemV2,
  formRuleList,
  getPictureUploadInitValue,
} from './utils';
import { type UsePluginFormStateReturn, type FormState } from './hooks';

import s from './index.module.less';

const HEADER_LIST_LENGTH_MAX = 20;

const doFormatTypeAndCreation = (info?: PluginInfoProps) =>
  info ? `${info?.plugin_type}-${info?.creation_method}` : '';

const FormCascader = withField(Cascader);

const getOptionList = () => [
  {
    label: I18n.t('plugin_creation_method_cloud_plugin_use_existing_services'),
    value: CLOUD_PLUGIN_COZE,
  },
];

export const PluginForm: FC<{
  pluginState: UsePluginFormStateReturn;
  visible: boolean;
  isCreate?: boolean;
  disabled?: boolean;
  editInfo?: PluginInfoProps;
}> = ({ pluginState, disabled, editInfo, isCreate, visible }) => {
  const {
    formApi,
    extItems,
    setExtItems,
    headerList,
    setHeaderList,
    isValidCheckResult,
    setIsValidCheckResult,
    pluginTypeCreationMethod,
    setPluginTypeCreationMethod,
    authOption,
  } = pluginState;

  const [FLAGS] = useFlags();
  const { compareLevel } = useBenefitBasic();
  const enterpriseInfo = useCurrentEnterpriseInfo();
  const [mainAuthType, setMainAuthType] = useState<number>(0);
  const [authType, setAuthType] = useState<number>(0);
  const [disableEditUrl, setDisableEditUrl] = useState<boolean>(false);
  // Compliance audit results
  const changeVal = () => {
    if (!isValidCheckResult) {
      setIsValidCheckResult(true);
    }
  };
  const creationMethodOption = getOptionList();
  const creationMethodTip = doGetCreationMethodTips();

  const [privateLinkMap, setPrivateLinkMap] = useState<Array<PrivateLink>>();
  const { data: privateNetworkListOptions } = useRequest(
    async () => {
      const { data } = await PluginDevelopApi.PrivateLinkList({
        enterprise_id: enterpriseInfo?.enterprise_id,
      });
      setPrivateLinkMap(data?.private_links);
      const list = data?.private_links?.map(item => ({
        label: item.name,
        value: item.id,
      }));

      return [
        {
          label: I18n.t('vpc_plugin_create_plugin_2'),
          value: '0',
        },
        ...(list ?? []),
      ];
    },
    {
      ready:
        compareLevel === UserLevel.Enterprise &&
        FLAGS['bot.studio.plugin_vpc'] &&
        !IS_OPEN_SOURCE,
    },
  );
  /**
   * Get the default icon, and set it to the form
   */
  const getIcon = async () => {
    try {
      const res = await DeveloperApi.GetIcon({
        icon_type: IconType.Plugin,
      });
      const iconData = res.data?.icon_list?.[0];
      if (!iconData) {
        return;
      }
      const { url = '', uri = '' } = iconData;
      formApi.current?.setValue('plugin_uri', [
        {
          url,
          uid: uri,
        },
      ]);
    } catch (e) {
      logger.info(`getIcon error: ${e}`);
    }
  };
  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!isCreate && editInfo) {
      /**
       * The following useStates are all update plugins
       */
      /**
       * Service has been expanded to the secondary menu in this demand. The primary menu of service is 1, and the secondary menu is 0, 1, 2.
       * In order not to change the history logic, the backend adds a sub_auth_type field to record the value of the secondary menu under the service, but the authType is still an array of length 1 and the value is 1.
       * Therefore, when the front end needs to manually determine that the auth_type is 1, the sub_auth_type is stuffed in to form an array of length 2, so that the casdar menu can backfill the content of editInfo
       * 5, 6, and 7 are for the front end to determine which one is selected. 5 is apiKey, 6 is zero, and 7 is oicd.
       * Good question. AuthType is an array, but the length is not fixed:
       * When the length of the auth_type is 1, it means that it is a service, and the content has and only 1. At this time, the sub_auth_type is one of 0, 1, and 2
       * 2. When the auth_type length is 2, it means oAuth, and the content is [3,4]. There is no sub_auth_type at this time
       */
      if (editInfo.meta_info?.auth_type?.at(0) === 1) {
        switch (editInfo.meta_info?.sub_auth_type) {
          case 0:
            setAuthType(5);
            break;
          case 1:
            setAuthType(6);
            break;
          case 2:
            setAuthType(7);
            break;
          default:
            setAuthType(0);
            break;
        }
      } else {
        setAuthType(editInfo.meta_info?.auth_type?.at(-1) ?? 0);
      }
      setMainAuthType(editInfo.meta_info?.auth_type?.at(0) ?? 0);
      setExtItems(
        findAuthTypeItemV2(
          authOption,
          editInfo.meta_info?.auth_type,
          editInfo.meta_info?.auth_type?.[1] ??
            editInfo.meta_info?.sub_auth_type,
        )?.items || [],
      );

      const header = editInfo.meta_info?.common_params?.[4] || [];
      setHeaderList([...header]);
      setPluginTypeCreationMethod(
        `${editInfo.plugin_type}-${editInfo.creation_method}`,
      );

      // Disable editing URLs if there is a private network connection
      if (
        editInfo?.meta_info?.private_link_id &&
        compareLevel === UserLevel.Enterprise &&
        FLAGS['bot.studio.plugin_vpc']
      ) {
        setDisableEditUrl(true);
      }
    } else {
      reset();
    }
  }, [visible]);

  const reset = () => {
    //Reset plugin
    getIcon();
    setAuthType(0);
    setAuthType(0);
    setExtItems([]);
    setHeaderList([{ name: 'User-Agent', value: 'Coze/1.0' }]);
    setIsValidCheckResult(true);
    setPluginTypeCreationMethod(undefined);
  };

  /** Add header */
  const addHeader = () => {
    setHeaderList(list => [...list, { name: '', value: '' }]);
  };
  /** Delete header */
  const deleteHeader = (index: number) => {
    // If it is the last header, only empty the content, not delete it
    setHeaderList(list =>
      list.length <= 1
        ? [{ name: '', value: '' }]
        : list.filter((_, i) => i !== index),
    );
  };
  /** Edit header */
  const editHeader = (index: number, header: commonParamSchema) => {
    setHeaderList(list => list.map((item, i) => (i === index ? header : item)));
  };

  const renderPluginCoze = () => {
    let authTypeInitValue = [0];
    if (!editInfo) {
      authTypeInitValue = [0];
    }
    // It's OAuth's case
    if (editInfo?.meta_info?.auth_type?.length === 2) {
      authTypeInitValue = editInfo?.meta_info?.auth_type;
    }
    // service & no auth
    else {
      // No authorization required, naturally no sub_auth_type
      if (editInfo?.meta_info?.auth_type?.at(0) === 0) {
        authTypeInitValue = editInfo?.meta_info?.auth_type;
      }
      // Service, with sub_auth_type
      else {
        if (typeof editInfo?.meta_info?.sub_auth_type !== 'undefined') {
          authTypeInitValue = [
            ...(editInfo?.meta_info?.auth_type || []),
            editInfo?.meta_info?.sub_auth_type,
          ];
        }
      }
    }
    return (
      <>
        {compareLevel === UserLevel.Enterprise &&
        FLAGS['bot.studio.plugin_vpc'] ? (
          <FormSelect
            label={{
              text: I18n.t('vpc_plugin_create_plugin_1'),
              required: true,
              extra: <InfoPopover data={extInfoText.private_link_id} />,
            }}
            field="private_link_id"
            style={{ width: '100%' }}
            initValue={editInfo?.meta_info?.private_link_id || '0'}
            onChange={value => {
              setDisableEditUrl(value !== '0');
              if (value === '0') {
                formApi.current?.setValue('url', '');
              } else {
                formApi.current?.setValue(
                  'url',
                  privateLinkMap?.find(item => item.id === value)
                    ?.plugin_access_url,
                );
              }
            }}
            optionList={privateNetworkListOptions}
          />
        ) : null}

        {/* plugin URL */}
        {!disabled ? (
          <FormInput
            disabled={disableEditUrl}
            className={s['textarea-single-line']}
            initValue={editInfo?.meta_info?.url}
            trigger={['blur', 'change']}
            field="url"
            label={I18n.t('create_plugin_modal_url1')}
            placeholder={I18n.t('create_plugin_modal_url2')}
            onBlur={() => {
              formApi.current?.setValue(
                'url',
                formApi.current?.getValue('url')?.trim(),
              );
            }}
            rules={disableEditUrl ? [] : formRuleList.url}
          />
        ) : null}
        {/* Plugin Header */}
        <Form.Slot
          className={s['header-list']}
          label={{
            text: I18n.t('plugin_create_header_list_title'),
            align: 'right',
            extra: (
              <div className={s['header-list-extra']}>
                <InfoPopover data={extInfoText.header_list} />
                {headerList.length < HEADER_LIST_LENGTH_MAX && !disabled && (
                  <IconButton
                    size="small"
                    color="secondary"
                    icon={<IconCozPlus className="coz-fg-hglt text-[16px]" />}
                    onClick={addHeader}
                  />
                )}
              </div>
            ),
          }}
        >
          <div className={s['header-list-box']}>
            <Row className={s['header-row']}>
              <Col span={9}>
                <div className={s['header-col-content']}>Key</div>
              </Col>
              <Col span={12}>
                <div className={s['header-col-content']}>Value</div>
              </Col>
              <Col span={3}>
                <div className={s['header-col-content']}>
                  {I18n.t('plugin_create_action_btn')}
                </div>
              </Col>
            </Row>

            <div>
              {headerList?.map((item, index) => (
                <Row
                  type="flex"
                  justify="space-between"
                  align="middle"
                  key={index}
                >
                  <Col span={9}>
                    <div className={s['col-content']}>
                      <Input
                        placeholder={'Name'}
                        value={item.name}
                        onChange={name => {
                          editHeader(index, { ...item, name });
                        }}
                        maxLength={100}
                        disabled={disabled}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className={s['col-content']}>
                      <Input
                        placeholder={'Value'}
                        value={item.value}
                        onChange={value => {
                          editHeader(index, { ...item, value });
                        }}
                        maxLength={2000}
                        disabled={disabled}
                      />
                    </div>
                  </Col>
                  <Col span={3}>
                    <div className={s['col-content']}>
                      <IconButton
                        size="small"
                        color="secondary"
                        icon={
                          <IconCozTrashCan className="coz-fg-secondary text-[14px]" />
                        }
                        disabled={disabled}
                        onClick={() => deleteHeader(index)}
                      />
                    </div>
                  </Col>
                </Row>
              ))}
            </div>
          </div>
        </Form.Slot>

        {/* Authorization method */}

        <FormCascader
          disabled={disabled}
          rules={[{ required: true }]}
          style={{ width: '100%' }}
          initValue={authTypeInitValue}
          field="auth_type"
          label={{
            text: I18n.t('create_plugin_modal_auth1'),
            extra: <InfoPopover data={extInfoText.auth} />,
          }}
          placeholder={I18n.t('please_select_an_authorization_method')}
          treeData={authOption}
          displayRender={(list: any) => {
            if (IS_RELEASE_VERSION) {
              const value = formApi.current?.getValue('auth_type');
              if (value?.[0] === 1 && value?.[1] === 1) {
                return I18n.t('plugin_auth_method_service_zti');
              }
            }
            return `${list.at(-1)}`;
          }}
          onChange={(value: any) => {
            setExtItems(
              findAuthTypeItemV2(authOption, [value.at(0)], value.at(-1))
                ?.items || [],
            );
          }}
        />

        {/* Authorization - Service - Service Token/API Key */}
        {mainAuthType === 1 && authType === 5 && (
          <>
            <Form.RadioGroup
              disabled={disabled}
              rules={[{ required: true }]}
              field="location"
              label={{
                text: I18n.t('create_plugin_modal_location'),
                extra: <InfoPopover data={extInfoText.location} />,
              }}
              options={locationOption}
              initValue={editInfo?.meta_info?.location || 1}
            />

            <FormInput
              disabled={disabled}
              initValue={editInfo?.meta_info?.key}
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

            <FormInput
              disabled={disabled}
              initValue={editInfo?.meta_info?.service_token}
              trigger={['blur', 'change']}
              field="service_token"
              label={{
                text: I18n.t('create_plugin_modal_Servicetoken'),
                extra: <InfoPopover data={extInfoText.service_token} />,
              }}
              placeholder={I18n.t('create_plugin_modal_Servicetoken_empty')}
              maxLength={2000}
              rules={formRuleList.service_token}
            />
          </>
        )}

        {/* Server level dynamic return authorization */}
        {/* Service - OIDC & OAuth - Standard Mode */}
        {extItems?.map((item, index) => {
          let formInfo: Record<string, any> = {};
          // Service - OIDC
          if (editInfo?.meta_info?.auth_type?.at(0) === 1) {
            formInfo = safeJSONParse(editInfo.meta_info.auth_payload);
          }
          // OAuth - Standard Mode
          if (editInfo?.meta_info?.auth_type?.at(0) === 3) {
            formInfo = safeJSONParse(editInfo.meta_info.oauth_info);
          }

          if (item.type === 'select') {
            return (
              <FormSelect
                disabled={disabled}
                key={item.key + index}
                label={item?.label || item.key}
                field={item.key}
                optionList={grantTypeOptions}
                initValue={formInfo?.[item.key] || item.default}
                style={{ width: '100%' }}
                rules={[
                  {
                    required: item.required,
                    // @ts-expect-error -- linter-disable-autofix
                    message: authOptionsPlaceholder[item.key],
                  },
                ]}
              />
            );
          }
          return (
            <Fragment key={item.key + index}>
              <FormInput
                disabled={disabled}
                key={item.key}
                trigger={['blur', 'change']}
                field={item.key}
                label={{
                  text: item?.label || item.key,
                  extra: extInfoText[item.key] && (
                    <InfoPopover data={extInfoText[item.key]} />
                  ),
                }}
                // @ts-expect-error -- linter-disable-autofix
                placeholder={authOptionsPlaceholder[item.key]}
                initValue={formInfo?.[item.key] || item.default}
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
                  ...(item?.ruleList || []),
                ]}
              />
            </Fragment>
          );
        })}
      </>
    );
  };

  return (
    <Form<FormState>
      getFormApi={api => (formApi.current = api)}
      autoScrollToError
      showValidateIcon={false}
      className={s['upload-form']}
      onValueChange={values => {
        if ('auth_type' in values) {
          if (values.auth_type.at(0) === 1) {
            switch (values.auth_type.at(-1)) {
              case 0:
                setAuthType(5);
                break;
              case 1:
                setAuthType(6);
                break;
              // @ts-expect-error Authorization type compatible
              case 2:
                setAuthType(7);
                break;
              default:
                setAuthType(0);
                break;
            }
          } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            setAuthType(values.auth_type.at(-1)!);
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          setMainAuthType(values.auth_type.at(0)!);
        }
      }}
    >
      {/* plugin avatar */}
      <PictureUpload
        noLabel
        disabled={disabled}
        fieldClassName={s['upload-field']}
        field="plugin_uri"
        iconType={IconType.Plugin}
        fileBizType={FileBizType.BIZ_PLUGIN_ICON}
        initValue={getPictureUploadInitValue(editInfo?.meta_info)}
        onChange={changeVal}
      />

      {/* Plugin name/plugin description/url/plugin type */}
      <>
        <FormTextArea
          disabled={disabled}
          initValue={editInfo?.meta_info?.name}
          field="name"
          className={s['textarea-single-line']}
          label={I18n.t('create_plugin_modal_name1')}
          placeholder={I18n.t('create_plugin_modal_name2')}
          trigger={['blur', 'change']}
          maxCount={30}
          maxLength={30}
          rows={1}
          onBlur={() => {
            formApi.current?.setValue(
              'name',
              formApi.current?.getValue('name')?.trim(),
            );
          }}
          onChange={changeVal}
          rules={formRuleList.name}
        />
        <FormTextArea
          disabled={disabled}
          initValue={editInfo?.meta_info?.desc}
          field="desc"
          label={I18n.t('create_plugin_modal_descrip1')}
          trigger={['blur', 'change']}
          placeholder={I18n.t('create_plugin_modal_descrip2')}
          rows={2}
          maxCount={600}
          maxLength={600}
          onBlur={() => {
            formApi.current?.setValue(
              'desc',
              formApi.current?.getValue('desc')?.trim(),
            );
          }}
          onChange={changeVal}
          rules={formRuleList.desc}
        />
        {/* plugin type */}
        <Form.Slot
          label={{
            text: I18n.t('plugin_creation_method'),
            required: true,
            extra: <InfoPopover data={creationMethodTip} />,
          }}
        >
          {isCreate ? (
            <Form.RadioGroup
              noLabel
              className={s['creation-method']}
              direction="vertical"
              rules={[
                {
                  required: true,
                  message: I18n.t(
                    'plugin_creation_select_creation_method_warning',
                  ),
                },
              ]}
              field="creation_method"
              disabled={disabled}
              options={creationMethodOption}
              initValue={
                editInfo ? doFormatTypeAndCreation(editInfo) : undefined
              }
              onChange={v => setPluginTypeCreationMethod(v.target.value)}
            />
          ) : (
            <Typography.Text fontSize="14px">
              {
                creationMethodOption.find(
                  option => option.value === pluginTypeCreationMethod,
                )?.label
              }
            </Typography.Text>
          )}
        </Form.Slot>
      </>

      {pluginTypeCreationMethod === CLOUD_PLUGIN_COZE
        ? renderPluginCoze()
        : null}
    </Form>
  );
};
