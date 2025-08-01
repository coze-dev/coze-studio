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
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useRequest } from 'ahooks';
import {
  ConnectorClassification,
  type ConnectorPublishConfig,
  type GetPublishRecordDetailRequest,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import {
  Banner,
  Button,
  IconButton,
  Toast,
  useFormApi,
} from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { intelligenceApi } from '@coze-arch/bot-api';

import { isPublishFinish } from '../utils/is-publish-finish';
import { MIN_PUBLISH_HEADER_HEIGHT } from '../utils/constants';
import { useProjectPublishStore } from '../store';
import { usePublishContainer } from '../context/publish-container-context';

export function PublishTitleBar() {
  const navigate = useNavigate();
  const formApi = useFormApi();
  const { space_id = '', project_id = '' } = useParams<DynamicParams>();
  const goBack = () => navigate(`/space/${space_id}/project-ide/${project_id}`);
  const {
    connectorList,
    showPublishResult,
    setShowPublishResult,
    versionDescription,
    versionNumber,
    connectors,
    unions,
    connectorPublishConfig,
    socialPlatformChatflow,
    selectedConnectorIds,
    setPublishRecordDetail,
  } = useProjectPublishStore(
    useShallow(s => ({
      connectorList: s.connectorList,
      showPublishResult: s.showPublishResult,
      setShowPublishResult: s.setShowPublishResult,
      versionNumber: s.versionNumber,
      versionDescription: s.versionDescription,
      connectors: s.connectors,
      unions: s.unions,
      connectorPublishConfig: s.connectorPublishConfig,
      socialPlatformChatflow: s.socialPlatformChatflow,
      selectedConnectorIds: s.selectedConnectorIds,
      setPublishRecordDetail: s.setPublishRecordDetail,
    })),
  );
  const [publishing, setPublishing] = useState(false);
  const { publishHeaderHeight, setPublishHeaderHeight } = usePublishContainer();
  // publish results poll
  const { run: getPublishRecordDetail, cancel } = useRequest(
    async (params: GetPublishRecordDetailRequest) =>
      await intelligenceApi.GetPublishRecordDetail(params),
    {
      pollingInterval: 3000,
      pollingWhenHidden: false,
      pollingErrorRetryCount: 3,
      manual: true,
      onSuccess: res => {
        if (res?.data) {
          setPublishRecordDetail(res.data);

          if (isPublishFinish(res.data)) {
            cancel();
          }
          if (!showPublishResult) {
            setShowPublishResult(true);
          }
        } else {
          cancel();
        }
      },
      onError: () => {
        cancel();
      },
    },
  );

  const handlePublishProject = async () => {
    if (showPublishResult) {
      goBack();
    } else {
      try {
        setPublishing(true);
        await formApi.validate();
        if (!selectedConnectorIds.length) {
          Toast.error(I18n.t('publish_tooltip_select_platform'));
          return;
        }
        const publishConnectors: Record<string, Record<string, string>> = {};
        const publishConnectorConfigs: Record<string, ConnectorPublishConfig> =
          {};
        selectedConnectorIds.forEach(id => {
          const connectorId = unions[id] ?? id;
          publishConnectors[connectorId] = connectors[connectorId] ?? {};
          // Unified chatflow options for social platforms
          if (
            connectorList.find(c => c.id === connectorId)
              ?.connector_classification ===
            ConnectorClassification.SocialPlatform
          ) {
            publishConnectorConfigs[connectorId] = socialPlatformChatflow;
          } else if (connectorPublishConfig[connectorId]) {
            publishConnectorConfigs[connectorId] =
              connectorPublishConfig[connectorId];
          }
        });

        const { data } = await intelligenceApi.PublishProject({
          project_id,
          version_number: versionNumber,
          description: versionDescription,
          connectors: publishConnectors,
          connector_publish_config: publishConnectorConfigs,
        });

        setPublishRecordDetail({
          publish_monetization_result: data?.publish_monetization_result,
        });
        if (data?.publish_record_id) {
          getPublishRecordDetail({
            publish_record_id: data.publish_record_id,
            project_id,
          });
        }
      } catch (error) {
        // Verification errors also need to be Toast Notification
        if (typeof Object.values(error as Error)[0] === 'string') {
          Toast.error(Object.values(error as Error)[0]);
        }
      } finally {
        setPublishing(false);
      }
    }
  };
  return (
    <div
      className="sticky top-0 z-[100] coz-bg-primary overflow-y-hidden"
      style={{ height: publishHeaderHeight }}
    >
      <Helmet>
        <title>{I18n.t('Publish')}</title>
      </Helmet>
      <div className="flex p-[16px] justify-between items-center  coz-stroke-primary border-b	border-x-0 border-t-0 border-solid pl-2">
        <div className="flex items-center">
          <IconButton
            icon={<IconCozArrowLeft className="h-[18px] w-[18px]" />}
            color="secondary"
            iconSize="large"
            onClick={goBack}
          />
          <span className="ml-[8px] font-medium text-[20px]">
            {I18n.t('Publish')}
          </span>
        </div>

        <Button
          onClick={handlePublishProject}
          loading={publishing}
          data-testid="project.publish"
        >
          {showPublishResult
            ? I18n.t('bot_publish_success_back')
            : I18n.t('Publish')}
        </Button>
      </div>
      <Banner
        type="info"
        description={I18n.t('project_release_notify')}
        onClose={() => {
          setPublishHeaderHeight(MIN_PUBLISH_HEADER_HEIGHT);
        }}
      ></Banner>
    </div>
  );
}
