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

/* eslint-disable complexity */
import ReactMarkdown from 'react-markdown';
import { type MouseEventHandler, useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useHover } from 'ahooks';
import {
  ConnectorBindType,
  ConnectorClassification,
  ConnectorConfigStatus,
  type ConnectorPublishConfig,
  type PublishConnectorInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Checkbox, Tooltip, Typography } from '@coze-arch/coze-design';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { type TextProps } from '@coze-arch/bot-semi/Typography';

import { TEMPLATE_CONNECTOR_ID } from '@/utils/constants';
import { useProjectPublishStore } from '@/store';

import { isStoreBindConfigured } from '../utils/is-store-bind-configured';
import { getConnectorNotConfigured } from '../utils/connector-disabled-publish';
import { McpConfigBtn } from './mcp-config-btn';
import { UnionSelect } from './connector-union-select';
import { ConnectorAction } from './connector-action';
import { ConfigStatus } from './config-status';
import { UndoButton } from './bind-actions/undo-button';

enum DisabledReason {
  /** Chatflow is not selected for social channels. */
  SocialPlatform,
  /** Unbound, Unauthorized */
  NotConfigured,
  /** The reason for the back-end delivery */
  NotAllowed,
  /** No template configured */
  Template,
}

interface ConnectorDisabledConfig {
  reason: DisabledReason;
  text?: string;
}

function getConnectorDisabledConfig({
  connector,
  socialPlatformConfig,
  templateConfigured,
  connectorPublishConfig,
  connectorConfigMap,
}: {
  connector: PublishConnectorInfo;
  socialPlatformConfig: ConnectorPublishConfig | undefined;
  templateConfigured: boolean | undefined;
  connectorPublishConfig: Record<string, ConnectorPublishConfig>;
  connectorConfigMap: Record<string, Record<string, string>>;
}): ConnectorDisabledConfig | undefined {
  if (
    connector.connector_classification ===
      ConnectorClassification.SocialPlatform &&
    !socialPlatformConfig?.selected_workflows?.[0]?.workflow_id
  ) {
    // Post to social channels without Chatflow selected.
    return {
      reason: DisabledReason.SocialPlatform,
      text: I18n.t('project_release_chatflow4'),
    };
  }
  const notConfigured = {
    reason: DisabledReason.NotConfigured,
    text: I18n.t('project_release_set_desc'),
  };
  // Unbound, Unauthorized
  if (getConnectorNotConfigured(connector)) {
    return notConfigured;
  }
  // The reason why it cannot be released after being issued by the backend.
  if (!connector.allow_publish && connector.not_allow_publish_reason) {
    return {
      reason: DisabledReason.NotAllowed,
      text: connector.not_allow_publish_reason,
    };
  }
  // No template configured
  if (connector.id === TEMPLATE_CONNECTOR_ID && !templateConfigured) {
    return {
      reason: DisabledReason.Template,
      text: I18n.t('project_release_template_info'),
    };
  }

  const isWebSDK =
    connector.connector_classification === ConnectorClassification.APIOrSDK &&
    connector.bind_type === ConnectorBindType.WebSDKBind;

  const isSdkChatFlowConfigured = Boolean(
    connectorPublishConfig[connector.id]?.selected_workflows,
  );

  if (isWebSDK && !isSdkChatFlowConfigured) {
    return notConfigured;
  }
  const isStorePublish =
    connector.connector_classification === ConnectorClassification.Coze &&
    connector.bind_type === ConnectorBindType.StoreBind;
  const storeConfig = connectorConfigMap[connector.id];
  if (isStorePublish && (!storeConfig || !isStoreBindConfigured(storeConfig))) {
    return notConfigured;
  }
}

// Additional descriptive information agreed upon with the backend
interface DescriptionExtra {
  // Channel name hover tooltip
  text?: string;
}

export interface ConnectorCardProps {
  connectorInfo: PublishConnectorInfo;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onShowWebSdkGuide: () => void;
}

// eslint-disable-next-line @coze-arch/max-line-per-function -- it's complex
export function ConnectorCard({
  connectorInfo,
  checked,
  onCheckedChange,
  onShowWebSdkGuide,
}: ConnectorCardProps) {
  const { id, name, description, bind_id = '' } = connectorInfo;

  const {
    templateConfigured,
    socialPlatformChatflow,
    connectorPublishConfig,
    connectors,
  } = useProjectPublishStore(
    useShallow(state => ({
      templateConfigured: state.templateConfigured,
      socialPlatformChatflow: state.socialPlatformChatflow,
      connectorPublishConfig: state.connectorPublishConfig,
      connectors: state.connectors,
    })),
  );
  const divRef = useRef<HTMLDivElement>(null);
  const isHover = useHover(divRef.current);

  const disabledConfig = getConnectorDisabledConfig({
    connector: connectorInfo,
    socialPlatformConfig: socialPlatformChatflow,
    templateConfigured,
    connectorPublishConfig,
    connectorConfigMap: connectors,
  });
  // The open-source version does not support social platform channels for future expansion.
  // When the social channel does not select "Process message conversation flow", the entire card needs to be displayed as disabled.
  const cardDisabled = disabledConfig?.reason === DisabledReason.SocialPlatform;

  const descriptionExtra = (typeSafeJSONParse(
    connectorInfo.description_extra,
  ) ?? {}) as DescriptionExtra;

  // If the disabled status changes, uncheck the current channel
  useEffect(() => {
    if (checked && disabledConfig) {
      onCheckedChange(false);
    }
  }, [checked, disabledConfig]);

  const connectorCheckbox = (
    <Checkbox
      checked={checked}
      onChange={() => {
        if (!disabledConfig) {
          onCheckedChange(!checked);
        }
      }}
      data-testid="project.publish.select.connector"
      disabled={Boolean(disabledConfig)}
    />
  );
  const stopEventPropagation: MouseEventHandler = mouseEvent => {
    mouseEvent.stopPropagation();
  };

  const getIsShowAction = () => {
    const isConnectorAuth = [
      ConnectorBindType.KvBind,
      ConnectorBindType.KvAuthBind,
      ConnectorBindType.AuthBind,
    ].includes(connectorInfo.bind_type);
    const isConnectorAuthConfigured =
      connectorInfo.config_status === ConnectorConfigStatus.Configured;

    if (isConnectorAuth) {
      return (
        !isConnectorAuthConfigured || (isConnectorAuthConfigured && isHover)
      );
    }

    return true;
  };

  const isShowAction = getIsShowAction();

  const connectorCard = (
    <div
      ref={divRef}
      className={classNames(
        'w-full min-h-[132px] rounded-[8px] coz-stroke-primary border border-solid coz-mg-card p-[12px] flex',
        cardDisabled || disabledConfig
          ? 'cursor-not-allowed'
          : 'cursor-pointer',
        isHover && 'coz-shadow-default',
      )}
      onClick={() => {
        if (!disabledConfig) {
          onCheckedChange(!checked);
        }
      }}
    >
      <div
        className={classNames('h-full w-full flex flex-col', {
          'opacity-30 pointer-events-none': cardDisabled,
        })}
      >
        <div className="flex gap-[6px] items-center font-medium">
          <img
            src={connectorInfo.icon_url}
            className="w-[24px] h-[24px] rounded-[6px] coz-stroke-primary border-[0.5px] border-solid border-solid"
          />
          {descriptionExtra.text ? (
            <Tooltip
              theme="dark"
              style={{ minWidth: '240px', textAlign: 'center' }}
              content={
                <ReactMarkdown
                  skipHtml={true}
                  linkTarget="_blank"
                  components={{
                    img: props => (
                      <img {...props} className="max-w-[224px] max-h-[208px]" />
                    ),
                  }}
                >
                  {descriptionExtra.text}
                </ReactMarkdown>
              }
            >
              <div className="coz-fg-primary cursor-default">{name}</div>
            </Tooltip>
          ) : (
            <div className="coz-fg-primary cursor-default">{name}</div>
          )}
          <ConfigStatus record={connectorInfo} />
        </div>
        <div className="mt-[4px] mb-[8px]">
          {description ? (
            <ReactMarkdown
              skipHtml={true}
              transformLinkUri={false}
              components={{
                p: props => (
                  <Typography.Paragraph type="secondary" fontSize="12px">
                    {props.children}
                  </Typography.Paragraph>
                ),
                a: props => {
                  const textProps: TextProps =
                    props.href === 'coze://web-sdk-guide'
                      ? {
                          link: true,
                          onClick: e => {
                            stopEventPropagation(e);
                            onShowWebSdkGuide();
                          },
                        }
                      : {
                          link: {
                            href: props.href,
                            target: '_blank',
                            onClick: stopEventPropagation,
                          },
                        };
                  return (
                    <Typography.Text fontSize="12px" {...textProps}>
                      {props.children}
                    </Typography.Text>
                  );
                },
              }}
            >
              {description}
            </ReactMarkdown>
          ) : null}
        </div>
        <div className="flex flex-wrap grow gap-[6px]">
          {connectorInfo.connector_union_id ? (
            <UnionSelect record={connectorInfo} />
          ) : null}
          <ConnectorAction
            record={connectorInfo}
            checked={checked}
            // This component has modal inside and cannot use conditional rendering.
            authActionWrapperClassName={classNames(!isShowAction && 'hidden')}
          />
          {connectorInfo.connector_classification ===
          ConnectorClassification.APIOrSDK ? (
            <UndoButton
              bindId={bind_id}
              checked={checked}
              connectorId={id}
              className={classNames(!isShowAction && 'hidden', 'mt-auto')}
              onClick={stopEventPropagation}
            />
          ) : null}
          {/* The open-source version does not support MCP service channels for future expansion */}
          {connectorInfo.connector_classification ===
            ConnectorClassification.CozeSpaceExtensionLibrary &&
            connectorInfo.bind_type === ConnectorBindType.TemplateBind && (
              <McpConfigBtn record={connectorInfo} />
            )}
        </div>
      </div>

      <div>
        {disabledConfig && !cardDisabled ? (
          <Tooltip theme="dark" content={disabledConfig.text}>
            {connectorCheckbox}
          </Tooltip>
        ) : (
          connectorCheckbox
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      theme="dark"
      visible={cardDisabled && isHover}
      content={disabledConfig?.text}
      trigger="custom"
    >
      {connectorCard}
    </Tooltip>
  );
}
