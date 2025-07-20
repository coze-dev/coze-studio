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

  // 绑定/解除绑定是同一个回调，可以根据 bind_id 是否为空来区分
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
        // 使用 basis-full 强制 flex row 换行
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
    // 社区版暂不支持商店渠道绑定，用于未来拓展
    case ConnectorBindType.StoreBind:
      return (
        <StoreBind
          checked={checked}
          record={record}
          onClick={stopEventPropagation}
        />
      );
    // 社区版暂不支持模板渠道绑定，用于未来拓展
    // bind_type=9 用作扣子第一方渠道的标识，需要按照渠道 ID 展示绑定方式
    // TODO 后端更新 ConnectorBindType 类型定义
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
