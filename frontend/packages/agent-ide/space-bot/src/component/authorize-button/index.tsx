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

import { type ConnectorConfigStatus } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Button, type ButtonProps } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useUIModal, UIButton, Typography } from '@coze-arch/bot-semi';
import {
  AuthStatus,
  type AuthLoginInfo,
  ConfigStatus,
} from '@coze-arch/bot-api/developer_api';
import { IconAlertCircle } from '@douyinfe/semi-icons';

import {
  checkAuthInfoValid,
  executeAuthRedirect,
  logAndToastAuthInfoError,
  useRevokeAuth,
} from '../../util/auth';

export interface AuthorizeButtonProps {
  origin: 'setting' | 'publish';
  id: string;
  agentType?: 'bot' | 'project';
  channelName: string;
  status: ConfigStatus | AuthStatus | ConnectorConfigStatus;
  revokeSuccess: (id: string) => void;
  authInfo: AuthLoginInfo;
  isMouseIn?: boolean;
  /** Whether to use the Button component of Coze 2.0, the default is false */
  isV2?: boolean;
  /** Custom Coze 2.0 Button props */
  v2ButtonProps?: ButtonProps;
  onBeforeAuthRedirect?: (
    parameters: Pick<AuthorizeButtonProps, 'id' | 'authInfo' | 'origin'>,
  ) => void;
}

export const AuthorizeButton = ({
  status,
  id,
  agentType = 'bot',
  channelName,
  revokeSuccess,
  origin,
  authInfo,
  isMouseIn = true,
  isV2 = false,
  v2ButtonProps = {
    color: 'highlight',
    size: 'small',
  },
  onBeforeAuthRedirect,
}: AuthorizeButtonProps) => {
  const isConfiguredOrConfiguring = [
    ConfigStatus.Configured,
    ConfigStatus.Configuring,
  ].includes(status as ConfigStatus);

  const handleAuth = () => {
    if (!checkAuthInfoValid(authInfo)) {
      logAndToastAuthInfoError();
      return;
    }

    if (
      (origin === 'publish' && status === ConfigStatus.NotConfigured) ||
      (origin === 'setting' && status === AuthStatus.Unauthorized)
    ) {
      sendTeaEvent(
        origin === 'publish'
          ? EVENT_NAMES.publish_oauth_button_click
          : EVENT_NAMES.settings_oauth_button_click,
        { action: '授权', channel_name: channelName },
      );
      onBeforeAuthRedirect?.({ id, authInfo, origin });
      executeAuthRedirect({ id, authInfo, origin });
    }

    if (
      (origin === 'publish' && isConfiguredOrConfiguring) ||
      (origin === 'setting' && status === AuthStatus.Authorized)
    ) {
      sendTeaEvent(
        origin === 'publish'
          ? EVENT_NAMES.publish_oauth_button_click
          : EVENT_NAMES.settings_oauth_button_click,
        { action: '解除授权', channel_name: channelName },
      );
      openRevokeAuthModal();
    }
  };

  const { revokeLoading, runRevoke } = useRevokeAuth({
    id,
    onRevokeSuccess: revokeSuccess,
    onRevokeFinally: () => closeRevokeAuthModal(),
  });

  const {
    open: openRevokeAuthModal,
    close: closeRevokeAuthModal,
    modal: revokeModal,
    visible: revokeModalVisible,
  } = useUIModal({
    confirmLoading: revokeLoading,
    type: 'info',
    title: I18n.t('user_revoke_authorization_title'),
    onOk: runRevoke,
    okText: I18n.t('Confirm'),
    cancelText: I18n.t('Cancel'),
    icon: (
      <IconAlertCircle
        style={{ color: 'var(--semi-color-danger)' }}
        size="extra-large"
      />
    ),
    onCancel: () => {
      closeRevokeAuthModal();
    },
    okButtonProps: {
      type: 'danger',
    },
  });

  const buttonText = I18n.t(
    isConfiguredOrConfiguring
      ? 'bot_publish_columns_action_revoke_authorize'
      : 'bot_publish_columns_action_authorize',
  );

  const authButton = isV2 ? (
    <Button onClick={handleAuth} {...v2ButtonProps}>
      {buttonText}
    </Button>
  ) : (
    <UIButton onClick={handleAuth} theme="borderless">
      {buttonText}
    </UIButton>
  );

  return status === ConfigStatus.Configured ? (
    <>
      {/* Display the "Revoke Authorization" button in the corresponding line of the hover channel form, or in the display of the "Revoke Authorization" pop-up window */}
      {isMouseIn || revokeModalVisible ? authButton : null}
      {revokeModal(
        agentType === 'project' ? (
          <Typography.Text type="secondary">
            {I18n.t('project_release_cancel1_desc')}
          </Typography.Text>
        ) : null,
      )}
    </>
  ) : (
    authButton
  );
};
