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

import { I18n } from '@coze-arch/i18n';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import {
  Button,
  Form,
  FormInput,
  FormSelect,
  FormTextArea,
  Input,
  Modal,
  Space,
} from '@coze-arch/coze-design';
import { FileBizType, IconType } from '@coze-arch/bot-api/developer_api';
import { useIsCurrentPersonalEnterprise } from '@coze-foundation/enterprise-store-adapter';
import { PictureUpload } from '@coze-common/biz-components/picture-upload';
import { NavLink } from 'react-router-dom';

import { useCustomPlatformSettingModalController } from '@/hook/publish-platform-setting/use-custom-platform-setting-modal-controller';
import { type IActionTarget } from '@/hook/publish-platform-setting/use-custom-platform-controller';

const CustomPlatformSettingModal = ({
  actionTarget,
  onCancel,
  onOk,
}: {
  actionTarget: IActionTarget;
  onCancel: () => void;
  onOk: () => void;
}) => {
  const {
    doCreate,
    doDel,
    doUpdate,
    doAsyncGetOauthData,
    // doAsyncGetSpaceList,
    spaceOptionList,
    oauthOptionsList,
    isLoadingOauthDatasource,
    isIdle,
    doCopy,
  } = useCustomPlatformSettingModalController(onOk);
  const isCurrentPersonalEnterprise = useIsCurrentPersonalEnterprise();

  const formRef = useRef<Form>();

  const doSubmit = async () => {
    try {
      if (actionTarget.action === 'delete') {
        doDel({ id: actionTarget?.payload?.id as string });
      } else {
        await formRef.current?.formApi.validate();

        const values = formRef.current?.formApi.getValues();

        values.connector_icon_uri = values?.avatar?.[0]?.uid;
        values.id = actionTarget?.payload?.id;

        actionTarget.action === 'create' ? doCreate(values) : doUpdate(values);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const innerBottomSlot = (
    <Space spacing={8} className="p-[8px] cursor-pointer w-full">
      <IconCozPlus className="text-[var(--coz-fg-hglt)]" />
      <NavLink
        className="text-[var(--coz-fg-hglt)] text-[14px] font-normal leading-[20px] no-underline"
        to={'/open/oauth/apps'}
        target="_blank"
      >
        {I18n.t('coze_custom_publish_platform_21')}
      </NavLink>
    </Space>
  );

  if (actionTarget.target === 'platform' && actionTarget.action === 'view') {
    return (
      <Modal
        visible
        width={480}
        title={I18n.t('coze_custom_publish_platform_55')}
        footer={null}
        onCancel={onCancel}
      >
        <p className="px-[8px] py-[6px] text-[12px] not-italic text-[var(--coz-fg-secondary)]">
          {I18n.t('coze_custom_publish_platform_57')}
        </p>
        <Space spacing={8}>
          <Input
            disabled
            value={actionTarget.payload?.token as string}
            className="w-[360px]"
          />
          <Button
            color="highlight"
            onClick={() => doCopy(actionTarget.payload?.token as string)}
          >
            {I18n.t('coze_custom_publish_platform_58')}
          </Button>
        </Space>
      </Modal>
    );
  }

  if (actionTarget.target === 'platform' && actionTarget.action === 'delete') {
    return (
      <Modal
        visible
        width={320}
        title={I18n.t('coze_custom_publish_platform_39')}
        okText={I18n.t('coze_custom_publish_platform_38')}
        okButtonColor="red"
        cancelText={I18n.t('coze_custom_publish_platform_27')}
        onOk={doSubmit}
        onCancel={onCancel}
      >
        {I18n.t('coze_custom_publish_platform_56')}
      </Modal>
    );
  }

  return (
    <Modal
      width={480}
      title={
        actionTarget.action === 'create'
          ? I18n.t('coze_custom_publish_platform_3')
          : I18n.t('coze_custom_publish_platform_37')
      }
      okText={I18n.t('coze_custom_publish_platform_28')}
      cancelText={I18n.t('coze_custom_publish_platform_27')}
      visible
      onCancel={onCancel}
      onOk={doSubmit}
      okButtonProps={{ loading: !isIdle }}
    >
      <Form<Record<string, unknown>>
        ref={formRef}
        initValues={actionTarget?.payload}
      >
        <PictureUpload
          fileBizType={FileBizType.BIZ_CONNECTOR_ICON}
          iconType={IconType.Connector}
          field="avatar"
          noLabel
          uploadClassName="flex justify-center items-center"
          triggerClassName="!rounded-[20px] overflow-hidden"
        />
        <FormInput
          rules={[
            {
              required: !0,
              message: I18n.t('coze_custom_publish_platform_29'),
            },
            {
              max: 20,
              message: I18n.t('workflow_derail_node_detail_title_max', {
                max: '20',
              }),
            },
            {
              pattern: /^[A-Za-z0-9\u4e00-\u9fa5_]+$/g,
              message: I18n.t('coze_custom_publish_platform_64'),
            },
          ]}
          field="connector_title"
          label={I18n.t('coze_custom_publish_platform_16')}
          placeholder={I18n.t('coze_custom_publish_platform_16')}
        />
        <FormTextArea
          rules={[
            {
              required: !0,
              message: I18n.t('coze_custom_publish_platform_30'),
            },
            {
              max: 100,
              message: I18n.t('workflow_derail_node_detail_title_max', {
                max: '100',
              }),
            },
          ]}
          field="connector_desc"
          label={I18n.t('coze_custom_publish_platform_17')}
          placeholder={I18n.t('coze_custom_publish_platform_18')}
          required
          maxCount={100}
          rows={3}
        />
        <FormSelect
          rules={[
            {
              required: !0,
              message: I18n.t('coze_custom_publish_platform_31'),
            },
          ]}
          placeholder={
            <span className="text-[var(--coz-fg-dim)]">
              {I18n.t('coze_custom_publish_platform_20')}
            </span>
          }
          field="oauth_app_id"
          label={I18n.t('coze_custom_publish_platform_19')}
          className="w-full"
          innerBottomSlot={innerBottomSlot}
          optionList={oauthOptionsList}
          onFocus={() => doAsyncGetOauthData()}
          loading={isLoadingOauthDatasource}
        />
        <FormInput
          placeholder={I18n.t('coze_custom_publish_platform_24')}
          field="callback_url"
          label={I18n.t('coze_custom_publish_platform_23')}
          className="w-full"
          rules={[
            {
              pattern: /^https?:\/\//g,
              message: I18n.t('coze_custom_publish_platform_32'),
            },
          ]}
        />
        {isCurrentPersonalEnterprise ? (
          <FormSelect
            rules={[
              {
                required: !0,
                message: I18n.t('coze_custom_publish_platform_34'),
              },
            ]}
            maxTagCount={2}
            multiple
            ellipsisTrigger
            optionList={spaceOptionList}
            field="space_id_list"
            label={I18n.t('coze_custom_publish_platform_63')}
            className="w-full"
            placeholder={
              <span className="text-[var(--coz-fg-dim)]">
                {I18n.t('coze_custom_publish_platform_26')}
              </span>
            }
            showRestTagsPopover
          />
        ) : null}
      </Form>
    </Modal>
  );
};

export { CustomPlatformSettingModal };
