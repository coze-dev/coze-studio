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

import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { MonetizePublishInfo } from '@coze-studio/components/monetize';
import {
  ConnectorClassification,
  type PublishConnectorInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { PublishTermService } from '@coze-agent-ide/agent-ide-commons';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { Form } from '@coze-arch/coze-design';

import { useWebSdkGuideModal } from '@/web-sdk-guide';
import { WEB_SDK_CONNECTOR_ID } from '@/utils/constants';
import { useProjectPublishStore } from '@/store';

import { CONNECTOR_TAB_BAR_Z_INDEX } from '../utils/constants';
import { usePublishContainer } from '../context/publish-container-context';
import { formatConnectorGroups } from './utils/format-connector-groups';
import { useConnectorScroll } from './hooks/use-connector-scroll';
import { useAutoScrollToConnector } from './hooks/use-auto-scroll-to-connector';
import { SocialPlatformChatflow } from './components/social-platform-chatflow';
import {
  ConnectorTabbar,
  ConnectorTabbarItem,
} from './components/connector-tab-bar';
import { ConnectorGroupHeader } from './components/connector-group-header';
import { ConnectorCard } from './components/connector-card';

import s from './index.module.less';

const getTermServiceData = (connectorList: PublishConnectorInfo[]) =>
  connectorList
    .filter(item => item.privacy_policy || item.user_agreement)
    .map(i => ({
      name: i.name,
      icon: i.icon_url,
      privacy_policy: i.privacy_policy,
      user_agreement: i.user_agreement,
    }));

// eslint-disable-next-line @coze-arch/max-line-per-function
export function PublishConnectors() {
  const { project_id = '' } = useParams<DynamicParams>();

  const {
    connectorList, // The open-source version only supports API and Chat SDK channels
    connectorUnionMap,
    monetizeConfig,
    selectedConnectorIds,
    connectorPublishConfig,
    unions,
    updateSelectedConnectorIds,
  } = useProjectPublishStore(
    useShallow(state => ({
      connectorList: state.connectorList,
      connectorUnionMap: state.connectorUnionMap,
      monetizeConfig: state.monetizeConfig,
      selectedConnectorIds: state.selectedConnectorIds,
      connectorPublishConfig: state.connectorPublishConfig,
      unions: state.unions,
      updateSelectedConnectorIds: state.updateSelectedConnectorIds,
    })),
  );

  const termServiceData = useMemo(
    () => getTermServiceData(connectorList),
    [connectorList],
  );

  const connectorGroups = useMemo(
    () =>
      formatConnectorGroups(connectorList, connectorUnionMap, unions).filter(
        item => item.connectors.length > 0,
      ),
    [connectorList, connectorUnionMap, unions],
  );
  const { publishHeaderHeight } = usePublishContainer();
  const {
    connectorRefMap,
    activeConnectorTarget,
    connectorBarRef,
    scrollToConnector,
    closeAnimation,
    animationStateMap,
  } = useConnectorScroll();

  useAutoScrollToConnector({
    connectorGroupList: connectorGroups,
    connectorRefMap,
  });

  const isConnectorChecked = (c: PublishConnectorInfo) =>
    selectedConnectorIds.includes(c.connector_union_id ?? c.id);

  const onCheckConnector = (c: PublishConnectorInfo, checked: boolean) => {
    const id = c.connector_union_id ?? c.id;
    if (checked) {
      updateSelectedConnectorIds(prev => prev.concat(id));
    } else {
      updateSelectedConnectorIds(prev => prev.filter(i => i !== id));
    }
  };

  // Collapse Panel does not display the icon of the selected channel in the header when expanded
  const getGroupHeaderList = (groupId: ConnectorClassification) => {
    const group = connectorGroups.find(g => g.type === groupId);
    if (!group) {
      return [];
    }
    return group.connectors.filter(c =>
      selectedConnectorIds.includes(c.connector_union_id ?? c.id),
    );
  };

  const { node: guideModal, show: showWebSdkGuide } = useWebSdkGuideModal();
  const onShowWebSdkGuide = () => {
    const sdkConnector = connectorList.find(c => c.id === WEB_SDK_CONNECTOR_ID);
    const sdkConfig = connectorPublishConfig[WEB_SDK_CONNECTOR_ID];
    showWebSdkGuide({
      projectId: project_id,
      workflowId: sdkConfig?.selected_workflows?.[0]?.workflow_id ?? '',
      version: sdkConnector?.bind_info?.sdk_version ?? '',
    });
  };

  return (
    <div className="flex flex-col mt-[24px] w-full coz-bg-plus rounded-md p-24px">
      <div className="flex items-center justify-between">
        <Form.Label required className="text-20px font-medium leading-[24px]">
          {I18n.t('bot_publish_select_title')}
        </Form.Label>
        {IS_OVERSEA && monetizeConfig ? (
          <MonetizePublishInfo
            className="pr-[8px] text-[12px]"
            monetizeConfig={monetizeConfig}
            supportPlatforms={connectorList
              .filter(c => c.support_monetization)
              .map(c => ({ id: c.id, name: c.name, icon: c.icon_url }))}
          />
        ) : null}
      </div>
      {termServiceData.length ? (
        <PublishTermService
          scene="project"
          termServiceData={termServiceData}
          className="mt-8px py-0 coz-fg-secondary"
        />
      ) : null}
      <ConnectorTabbar
        className="sticky"
        ref={connectorBarRef}
        style={{
          top: publishHeaderHeight,
          zIndex: CONNECTOR_TAB_BAR_Z_INDEX,
        }}
      >
        {connectorGroups.map(connector => (
          <ConnectorTabbarItem
            key={connector.type}
            selectedConnectorCount={getGroupHeaderList(connector.type).length}
            isActive={
              activeConnectorTarget === connectorRefMap[connector.type].current
            }
            onClick={() => scrollToConnector(connector.type)}
          >
            {connector.label}
          </ConnectorTabbarItem>
        ))}
      </ConnectorTabbar>
      {connectorGroups.map((i, index) => {
        // The open-source version does not support social platform channels for the time being
        const isSocialPlatform =
          i.type === ConnectorClassification.SocialPlatform;
        return (
          <div
            key={i.type}
            ref={connectorRefMap[i.type]}
            style={{ marginTop: index === 0 ? 0 : 24 }}
          >
            <ConnectorGroupHeader
              label={i.label}
              tooltipContent={i.desc}
              showTooltipInfo={isSocialPlatform}
              isHighlight={animationStateMap[i.type]}
              type={i.type}
              onAnimationEnd={() => {
                closeAnimation(i.type);
              }}
            />
            {/* The open-source version does not support social platform channels for the time being */}
            {isSocialPlatform ? (
              <SocialPlatformChatflow className="mb-8px" />
            ) : null}
            <div
              className={classNames(
                'grid grid-cols-2 gap-[12px]',
                s['publish-cards'],
              )}
            >
              {i.connectors.map(c => (
                <ConnectorCard
                  key={c.id}
                  connectorInfo={c}
                  checked={isConnectorChecked(c)}
                  onCheckedChange={checked => onCheckConnector(c, checked)}
                  onShowWebSdkGuide={onShowWebSdkGuide}
                />
              ))}
            </div>
          </div>
        );
      })}
      {!connectorList.length ? (
        <div className="flex flex-col justify-center items-center w-full h-full gap-[4px]">
          <IconCozEmpty className="w-[32px] h-[32px] coz-fg-dim" />
          <div className="text-[14px] font-medium coz-fg-primary">
            {I18n.t('publish_page_no_channel_status_title')}
          </div>
          <div className="text-[12px] coz-fg-primary">
            {I18n.t('publish_page_no_channel_status_desc')}
          </div>
        </div>
      ) : null}
      {guideModal}
    </div>
  );
}
