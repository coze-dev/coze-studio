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
import { useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import { type PublishConnectorInfo } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { UIButton, useUIModal, UIToast, Spin } from '@coze-arch/bot-semi';
import { isApiError, type ApiError } from '@coze-arch/bot-http';
import {
  type PublishConnectorInfo as BotPublishConnectorInfo,
  type QuerySchemaConfig,
  BindType,
  SchemaAreaPageApi,
  type BindConnectorResponse,
  type SchemaAreaInfo,
  type CopyLinkAreaInfo,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { connector2Redirect } from '@coze-foundation/account-adapter';

import styles from '../../pages/publish/index.module.less';
import { useUnbindPlatformModal } from '../../hook/use-unbind-platform';
import { type FormActions, type TSubmitValue } from './types';
import { type ActionResponse, useStepAction } from './hooks/use-step-action';
import { ConnectorLink } from './connector-link';
import { ConnectorGuide } from './connector-guide';
import { ConnectorForm } from './connector-form';
import { ConnectorError } from './connector-error';

interface ConnectorConfigureProps {
  botId: string;
  origin?: 'project' | 'bot';
  onSuccess: (
    val: BotPublishConnectorInfo | PublishConnectorInfo | undefined,
  ) => void;
  onUnbind?: () => void;
}

interface ConnectorConfigureValueType {
  initValue: BotPublishConnectorInfo | PublishConnectorInfo;
}

// eslint-disable-next-line complexity
export const useConnectorFormModal = ({
  botId,
  origin = 'bot',
  onSuccess,
  onUnbind,
}: ConnectorConfigureProps) => {
  const formRef = useRef<FormActions>(null);

  const [propsValue, setPropsValue] = useState<ConnectorConfigureValueType>();

  const { initValue } = propsValue ?? {};
  const [errorMessage, setErrorMessage] = useState<ApiError>();

  const [formDisabled, setFormDisabled] = useState(false);

  const [assignValue, setAssignValue] = useState<TSubmitValue>();
  const bindId = useRef('');
  const handleClose = () => {
    setErrorMessage(undefined);
    setStep(0);
    setAssignValue(undefined);
    formRef.current?.reset();
    close();
  };

  const handleUnbind = () => {
    handleClose();
    if (onUnbind) {
      onUnbind();
    } else {
      // Compatible with historical logic, when onUnbind is not passed in, onSuccess is also called after unbinding.
      onSuccess({
        ...(initValue as BotPublishConnectorInfo),
        bind_info: {},
        bind_id: '',
      });
    }
    UIToast.success(I18n.t('bot_publish_disconnect_success'));
  };

  const [connectorConfigInfo, setConnectorConfigInfo] =
    useState<QuerySchemaConfig>();

  const lastConnectId = useRef<string>();

  const { loading: formSchemaLoading } = useRequest(
    async () => {
      const data = await DeveloperApi.QuerySchemaList({
        connector_id: initValue?.id ?? '',
        scene: origin,
      });
      return data;
    },
    {
      ready: Boolean(initValue?.id),
      refreshDeps: [initValue?.id],
      onBefore: () => {
        if (initValue?.id !== lastConnectId.current) {
          lastConnectId.current = initValue?.id;
          setConnectorConfigInfo({});
        }
      },
      onSuccess: data => {
        if (!data.schema_area_pages?.length) {
          data.schema_area_pages = [
            {
              schema_area: data.schema_area,
              copy_link_area: data.copy_link_area,
            },
          ];
        }
        setConnectorConfigInfo(data);
      },
      onError: () => {
        setConnectorConfigInfo({});
      },
    },
  );
  const { schema_area_pages: schemaPages = [] } = connectorConfigInfo ?? {};

  const bindCb = (data: BindConnectorResponse) => {
    /** Applicable to Kv + Auth authorization scenarios: KvAuthBind = 4
     * Reddit channel: If the client_id is successfully returned, the client_id in the auth_login_info will be overwritten and the encrypted state jump authorization page will be attached
     * Other channels: If the auth_params is successfully returned, the merge auth_login_info jump as the authorization link parameter
     * */
    if (
      initValue?.bind_type === BindType.KvAuthBind &&
      (data?.client_id || data?.auth_params)
    ) {
      connector2Redirect(
        {
          navigatePath: `${location.pathname}${location.search}`,
          type: 'oauth',
          extra: {
            origin: 'publish',
            encrypt_state: data?.encrypt_state,
          },
        },
        initValue?.id || '',
        {
          ...initValue?.auth_login_info,
          client_id: data?.client_id,
          ...data.auth_params,
        },
      );
    } else {
      bindId.current = data?.bind_id ?? '';
    }
  };

  const stepCallback = () => {
    const isLastStep = step === schemaPages?.length - 1;
    if (isLastStep) {
      if (initValue) {
        onSuccess({
          ...initValue,
          bind_info: { ...assignValue },
          bind_id: bindId.current,
        });
      }
      handleClose();
    } else {
      setStep(step + 1);
    }
  };

  const {
    loading,
    run: nextStepRun,
    step,
    setStep,
  } = useStepAction({
    botId,
    origin,
    schemaPages,
    onNextStepSuccess: (resp: ActionResponse) => {
      if (resp.action === SchemaAreaPageApi.BindConnector) {
        bindCb(resp.data);
      }
      if (resp.action === SchemaAreaPageApi.GetBindConnectorConfig) {
        setAssignValue({
          ...assignValue,
          ...resp.data.config?.detail,
        });
      }
      stepCallback();
    },
    onNextStepError: error => {
      if (isApiError(error)) {
        setErrorMessage(error);
      }
    },
  });

  const { node: unbindPlatformModal, open: openUnbindPlatformModal } =
    useUnbindPlatformModal({
      botId,
      origin,
      platformInfo: initValue as BotPublishConnectorInfo,
      onUnbind: () => {
        handleUnbind();
      },
    });

  const nextBtnClick = async () => {
    const value = await formRef.current?.submit();
    setAssignValue({ ...assignValue, ...value });
    nextStepRun({
      connectorId: initValue?.id ?? '',
      assignFormValue: { ...assignValue, ...value },
    });
  };

  const renderFooter = () =>
    initValue?.bind_id ? (
      <>
        <UIButton
          theme="light"
          type="tertiary"
          onClick={() => {
            close();
            setStep(0);
          }}
        >
          {I18n.t('Cancel')}
        </UIButton>
        <UIButton theme="solid" type="danger" onClick={openUnbindPlatformModal}>
          {I18n.t('bot_publish_disconnect', {
            platform: initValue?.name ?? '',
          })}
        </UIButton>
      </>
    ) : (
      <>
        {schemaPages?.length &&
        step !== 0 &&
        schemaPages[step]?.api_action !== SchemaAreaPageApi.NotQuery ? (
          // When the page button does not perform any action, the previous step is not displayed
          <UIButton
            theme="solid"
            onClick={() => {
              setErrorMessage(undefined);
              setStep(step - 1);
            }}
          >
            {I18n.t('Previous_1')}
          </UIButton>
        ) : null}
        <UIButton
          theme="solid"
          onClick={nextBtnClick}
          disabled={formDisabled}
          loading={loading}
        >
          {step === (schemaPages?.length ?? 0) - 1
            ? schemaPages[step]?.api_action !== SchemaAreaPageApi.NotQuery
              ? I18n.t('Save')
              : I18n.t('Complete')
            : I18n.t('Next_1')}
        </UIButton>
      </>
    );

  const { modal, open, close } = useUIModal({
    type: 'action-small',
    footer: renderFooter(),
    onCancel: handleClose,
    title: connectorConfigInfo?.title_text,
  });

  const renderConnectorArea = (
    copyArea?: CopyLinkAreaInfo,
    schemaArea?: SchemaAreaInfo,
  ) => (
    <>
      {copyArea ? (
        <ConnectorLink
          copyLinkAreaInfo={copyArea}
          agentType={origin}
          botId={botId}
          initValue={{ ...initValue?.bind_info, ...assignValue }}
        />
      ) : null}
      {schemaArea ? (
        <ConnectorForm
          schemaAreaInfo={schemaArea}
          initValue={{ ...initValue?.bind_info, ...assignValue }}
          ref={formRef}
          getFormDisable={disable => setFormDisabled(disable)}
          isReadOnly={Boolean(initValue?.bind_id)}
          setErrorMessage={setErrorMessage}
        />
      ) : null}
      {errorMessage ? <ConnectorError errorMessage={errorMessage} /> : null}
    </>
  );
  return {
    node: modal(
      <Spin
        wrapperClassName={styles['config-area']}
        spinning={formSchemaLoading}
      >
        <ConnectorGuide connectorConfigInfo={connectorConfigInfo} />

        {schemaPages?.length && !initValue?.bind_id ? (
          <div>
            {renderConnectorArea(
              schemaPages[step]?.copy_link_area,
              schemaPages[step]?.schema_area,
            )}
          </div>
        ) : null}
        {initValue?.bind_id && schemaPages?.length ? (
          <>
            {schemaPages?.map((item, i) => (
              <div key={i}>
                {renderConnectorArea(item.copy_link_area, item.schema_area)}
              </div>
            ))}
          </>
        ) : null}
        {unbindPlatformModal}
      </Spin>,
    ),
    open: (props: ConnectorConfigureValueType) => {
      setPropsValue(props);
      open();
    },
    close,
  };
};
