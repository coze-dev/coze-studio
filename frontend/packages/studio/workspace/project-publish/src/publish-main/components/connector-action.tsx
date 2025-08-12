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

import { type MouseEventHandler } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import {
  ConnectorBindType,
  type PublishConnectorInfo,
  ConnectorConfigStatus,
  ConnectorStatus,
} from '@coze-arch/idl/intelligence_api';
import { KvBindButton } from '@coze-agent-ide/space-bot/component/connector-action';
import { AuthorizeButton } from '@coze-agent-ide/space-bot/component/authorize-button';

import { TEMPLATE_CONNECTOR_ID } from '@/utils/constants';

import { useProjectPublishStore } from '../../store';
import { useBizConnectorAnchor } from '../../hooks/use-biz-connector-anchor';
import { WebSdkBind } from './bind-actions/web-sdk-bind';
import { TemplateBind } from './bind-actions/template-bind';
import { StoreBind } from './bind-actions/store-bind';
// import { ApiBind } from './bind-actions/api-bind';

interface ConnectorActionProps {
  record: PublishConnectorInfo;
  checked: boolean;
  authActionWrapperClassName?: string;
}
export function ConnectorAction(props: ConnectorActionProps) {
  const { record, checked, authActionWrapperClassName } = props;

  const { setProjectPublishInfo, connectorList, selectedConnectorIds } =
    useProjectPublishStore(
      useShallow(state => ({
        setProjectPublishInfo: state.setProjectPublishInfo,
        connectorList: state.connectorList,
        selectedConnectorIds: state.selectedConnectorIds,
      })),
    );

  const { setAnchor } = useBizConnectorAnchor();
  const stopEventPropagation: MouseEventHandler = mouseEvent => {
    mouseEvent.stopPropagation();
  };

  // The bind/unbind is the same callback, which can be distinguished by whether the bind_id is empty or not
  const kvBindSuccessCallback = (value?: PublishConnectorInfo) => {
    if (value) {
      const isUnbind = !value.bind_id;
      const newValue: PublishConnectorInfo = {
        ...value,
        config_status: isUnbind
          ? ConnectorConfigStatus.NotConfigured
          : ConnectorConfigStatus.Configured,
        connector_status: isUnbind
          ? ConnectorStatus.Normal
          : value.connector_status,
      };
      setProjectPublishInfo({
        connectorList: connectorList.map(item =>
          item.id === value.id ? newValue : item,
        ),
      });
    }
  };

  const authRevokeSuccess = () => {
    setProjectPublishInfo({
      connectorList: connectorList.map(item => {
        if (item.id === record.id) {
          return {
            ...item,
            config_status: ConnectorConfigStatus.NotConfigured,
          };
        }
        return item;
      }),
      selectedConnectorIds: selectedConnectorIds.filter(
        item => item !== record.id,
      ),
    });
  };

  switch (record.bind_type) {
    case ConnectorBindType.KvBind:
    case ConnectorBindType.KvAuthBind:
      return (
        // Force flex row wrap with basis-full
        <div
          className={classNames(
            'basis-full self-end',
            authActionWrapperClassName,
          )}
        >
          <div className="inline-flex" onClick={stopEventPropagation}>
            <KvBindButton
              record={record}
              bindSuccessCallback={kvBindSuccessCallback}
              origin="project"
            />
          </div>
        </div>
      );
    case ConnectorBindType.AuthBind:
      return (
        <div
          className={classNames(
            'basis-full self-end',
            authActionWrapperClassName,
          )}
        >
          <div className="inline-flex" onClick={stopEventPropagation}>
            <AuthorizeButton
              origin="publish"
              id={record.id}
              agentType="project"
              channelName={record.name}
              status={
                record.config_status ?? ConnectorConfigStatus.NotConfigured
              }
              onBeforeAuthRedirect={({ id }) => {
                setAnchor(id);
              }}
              revokeSuccess={authRevokeSuccess}
              authInfo={record?.auth_login_info ?? {}}
              isV2
              v2ButtonProps={{
                color: 'primary',
                size: 'small',
              }}
            />
          </div>
        </div>
      );
    case ConnectorBindType.WebSDKBind:
      return (
        <WebSdkBind
          checked={checked}
          record={record}
          onClick={stopEventPropagation}
        />
      );
    // The open-source version does not support store channel binding for the time being, for future expansion
    case ConnectorBindType.StoreBind:
      return (
        <StoreBind
          checked={checked}
          record={record}
          onClick={stopEventPropagation}
        />
      );
    // The open-source version does not support template channel binding for future expansion
    // bind_type = 9 is used as the logo of the first-party channel of the button, and the binding method needs to be displayed according to the channel ID.
    // TODO backend updates ConnectorBindType type definition
    case ConnectorBindType.TemplateBind: {
      if (record.id === TEMPLATE_CONNECTOR_ID) {
        return <TemplateBind record={record} onClick={stopEventPropagation} />;
      }
      return null;
    }
    default:
      return null;
  }
}
