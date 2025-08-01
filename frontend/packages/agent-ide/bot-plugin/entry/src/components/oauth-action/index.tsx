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

/* eslint-disable max-len */
import { type FC } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozArrowRight,
  IconCozCheckMarkFill,
} from '@coze-arch/coze-design/icons';
import { Space, Typography } from '@coze-arch/coze-design';
import { Modal } from '@coze-arch/bot-semi';

import { useAuthForApiTool } from '@/hooks/auth/use-auth-for-api-tool';

interface IOauthProps {
  className?: string;
}

const doConfirmOAuth = (doOauth: () => void) => {
  Modal.info({
    title: I18n.t('plugin_tool_config_auth_modal_auth_required'),
    content: I18n.t('plugin_tool_config_auth_modal_auth_required_desc'),
    onOk: doOauth,
    okText: I18n.t('Confirm'),
    cancelText: I18n.t('Cancel'),
  });
};

const doConfirmCancelOauth = (doCancelOauth: () => void) => {
  Modal.warning({
    title: I18n.t('plugin_tool_config_auth_modal_cancel_confirmation'),
    content: I18n.t('plugin_tool_config_auth_modal_cancel_confirmation_desc'),
    onOk: doCancelOauth,
    okText: I18n.t('Confirm'),
    cancelText: I18n.t('Cancel'),
  });
};

const OauthHeaderAction = () => {
  const {
    needAuth,
    isHasAuth,
    doCancelOauth,
    isUpdateLoading,
    doOauth,
    canEdit,
  } = useAuthForApiTool();

  if (!canEdit) {
    return <></>;
  }

  const isEnableCancelAuthorization = needAuth && isHasAuth;
  const isEnableAuthorization = needAuth && !isHasAuth;

  return (
    <Space spacing={8}>
      {needAuth ? (
        <span className="rounded-[4px] bg-[#EDD5FC] px-[8px] py-[2px] text-[#6C2CC6] text-[12px] font-medium leading-[16px]">
          {I18n.t('plugin_mark_created_by_existing_services')}
        </span>
      ) : null}
      {needAuth ? (
        <Typography.Text
          disabled={isUpdateLoading}
          onClick={() => {
            if (isEnableAuthorization) {
              doConfirmOAuth(doOauth);
              return;
            }
            if (isEnableCancelAuthorization) {
              doConfirmCancelOauth(doCancelOauth);
            }
          }}
          icon={isHasAuth ? <IconCozCheckMarkFill /> : undefined}
          className={classNames(
            'overflow-hidden text-[#4C54F0] overflow-ellipsis text-[14px] font-normal leading-[20px]',
            (isEnableAuthorization || isEnableCancelAuthorization) &&
              'cursor-pointer',
          )}
        >
          {isHasAuth
            ? I18n.t('plugin_tool_config_status_authorized')
            : I18n.t('plugin_tool_config_status_unauthorized')}
        </Typography.Text>
      ) : null}
      {!isHasAuth && needAuth ? (
        <IconCozArrowRight className="w-[12px] h-[12px] ml-[-6px]" />
      ) : null}
    </Space>
  );
};

const OauthButtonAction: FC<IOauthProps> = ({ className }) => {
  const {
    needAuth,
    isHasAuth,
    doCancelOauth,
    isUpdateLoading,
    doOauth,
    canEdit,
  } = useAuthForApiTool();

  if (!canEdit) {
    return <></>;
  }

  return needAuth ? (
    <Typography.Text
      disabled={isUpdateLoading}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        console.log('click');
        if (isHasAuth) {
          doConfirmCancelOauth(doCancelOauth);
        } else {
          doConfirmOAuth(doOauth);
        }
      }}
      icon={isHasAuth ? <IconCozCheckMarkFill /> : undefined}
      className={`overflow-hidden text-[#4C54F0] overflow-ellipsis text-[14px] font-normal leading-[20px] cursor-pointer px-[12px] py-[0] items-center ${className}`}
    >
      {isHasAuth
        ? I18n.t('plugin_tool_config_status_authorized')
        : I18n.t('plugin_tool_config_status_unauthorized')}
    </Typography.Text>
  ) : null;
};

export { OauthHeaderAction, OauthButtonAction };
