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
import { useRef } from 'react';

import { useMemoizedFn } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import {
  Input,
  InputNumber,
  Empty,
  Form,
  Spin,
  Modal,
} from '@coze-arch/coze-design';
import { CheckboxGroup, withField } from '@coze-arch/bot-semi';
import { type FormSchemaItem } from '@coze-arch/bot-api/connector_api';
import {
  IllustrationNoContent,
  IllustrationNoContentDark,
} from '@douyinfe/semi-illustrations';

import { useOauthSettingModalController } from '@/hook/publish-platform-setting/use-oauth-setting-modal-controller';
import { type IActionTarget } from '@/hook/publish-platform-setting/use-custom-platform-controller';

const FormIpt = withField(Input);

const FormIptNum = withField(InputNumber);

const FormCheckbox = withField(CheckboxGroup);

const OauthSettingModal = ({
  actionTarget,
  onCancel,
  onOk,
}: {
  actionTarget: IActionTarget;
  onCancel: () => void;
  onOk: () => void;
}) => {
  const formRef = useRef<Form>();

  const cb = useMemoizedFn(() => {
    onOk();
  });

  const {
    doUpdate,
    oauthFormItemConfigs,
    oauthModalTitle,
    oauthModalDesc,
    isOauthConfigLoading,
    isUpdateOauthConfigLoading,
  } = useOauthSettingModalController(actionTarget, cb);

  const doSubmit = async () => {
    try {
      await formRef.current?.formApi.validate();

      const values = formRef.current?.formApi.getValues();

      doUpdate({
        connector_id: actionTarget?.payload?.id as string,
        oauth_config: JSON.stringify(values),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const doGetFormItemRender = (formItemConfig: FormSchemaItem) => {
    switch (formItemConfig.component) {
      case 'Input':
        return (
          <FormIpt
            key={formItemConfig.title}
            rules={formItemConfig.rules}
            field={formItemConfig.name}
            label={formItemConfig.title}
            placeholder={
              formItemConfig?.placeholder
                ? formItemConfig?.placeholder
                : formItemConfig.title
            }
          />
        );
      case 'InputNumber':
        return (
          <FormIptNum
            key={formItemConfig.title}
            className="w-full"
            rules={formItemConfig.rules}
            field={formItemConfig.name}
            label={formItemConfig.title}
            placeholder={
              formItemConfig?.placeholder
                ? formItemConfig?.placeholder
                : formItemConfig.title
            }
          />
        );
      case 'Select':
        return (
          <Form.Select
            key={formItemConfig.title}
            className="w-full"
            rules={formItemConfig.rules}
            field={formItemConfig.name}
            label={formItemConfig.title}
            placeholder={
              formItemConfig?.placeholder
                ? formItemConfig?.placeholder
                : formItemConfig.title
            }
            optionList={formItemConfig.enums ?? []}
          />
        );

      case 'Radio':
        return (
          <Form.RadioGroup
            key={formItemConfig.title}
            rules={formItemConfig.rules}
            field={formItemConfig.name}
            label={formItemConfig.title}
            options={formItemConfig.enums ?? []}
          />
        );
      case 'Checkbox':
        return (
          <FormCheckbox
            key={formItemConfig.title}
            rules={formItemConfig.rules}
            field={formItemConfig.name}
            label={formItemConfig.title}
            options={formItemConfig.enums ?? []}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    <Modal
      bodyStyle={{ maxHeight: '652px', overflowY: 'auto' }}
      width={480}
      title={oauthModalTitle}
      okText={I18n.t('coze_custom_publish_platform_28')}
      cancelText={I18n.t('coze_custom_publish_platform_27')}
      visible
      onCancel={onCancel}
      onOk={doSubmit}
      okButtonProps={{
        loading: isUpdateOauthConfigLoading,
      }}
    >
      <Spin spinning={isOauthConfigLoading}>
        {!oauthFormItemConfigs?.length && !isOauthConfigLoading ? (
          <Empty
            className="pt-[120px]"
            image={
              <IllustrationNoContent style={{ width: 150, height: 150 }} />
            }
            darkModeImage={
              <IllustrationNoContentDark style={{ width: 150, height: 150 }} />
            }
            description={I18n.t('api_analytics_null')}
          />
        ) : (
          <>
            <p className="text-[14px] leading-[20px] text-[var(--coz-fg-primary)] mt-[6px]">
              {oauthModalDesc}
            </p>
            <Form<Record<string, unknown>>
              ref={formRef}
              initValues={
                actionTarget?.payload?.config as Record<string, unknown>
              }
            >
              {oauthFormItemConfigs?.map(config => doGetFormItemRender(config))}
            </Form>
          </>
        )}
      </Spin>
    </Modal>
  );
};

export { OauthSettingModal };
