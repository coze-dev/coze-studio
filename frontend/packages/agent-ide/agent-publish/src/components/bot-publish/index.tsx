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

import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import { userStoreService } from '@coze-studio/user-store';
import { BackButton } from '@coze-foundation/layout';
import { useReportTti } from '@coze-arch/report-tti';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { useErrorHandler } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { SpaceApi } from '@coze-arch/bot-space-api';
import { UILayout, UIButton, Spin, Tooltip } from '@coze-arch/bot-semi';
import {
  Publish,
  type PublishConnectorInfo,
  type ConnectorBrandInfo,
} from '@coze-arch/bot-api/developer_api';
import {
  type PublishResultInfo,
  type PublishRef,
  PublishDisabledType,
} from '@coze-agent-ide/space-bot';

import { PublishTableContext, PublishTable } from './publish-table';
import { PublishResult } from './publish-result';
import { useGetPublisherInitInfo } from './hooks/use-get-bot-info';
import { useAuthFail } from './hooks/use-auth-fail';

import styles from './index.module.less';

const getPublishPlatformEvent = createReportEvent({
  eventName: ReportEventNames.publishPlatform,
});

export const AgentPublishPage = () => {
  const params = useParams<DynamicParams>();
  const navigate = useNavigate();
  const errorHandler = useErrorHandler();

  const { bot_id, commit_version } = params;

  const { botInfo, monetizeConfig } = useGetPublisherInitInfo();

  const [publishStatus, setPublishStatus] = useState(Publish.NoPublish);
  const [connectInfoList, setConnectInfoList] =
    useState<PublishConnectorInfo[]>();
  const [connectorBrandInfoMap, setConnectorBrandInfoMap] =
    useState<Record<string, ConnectorBrandInfo>>();
  const [publishResult, setPublishResult] = useState<PublishResultInfo>();
  const [publishDisabled, setPublishDisabled] = useState<PublishDisabledType>();
  const [publishLoading, setPublishLoading] = useState(false);
  const [canOpenSource, setCanOpenSource] = useState(false);
  const [publishTips, setPublishTips] = useState<string>('');
  const publishRef = useRef<PublishRef>(null);

  const userAuthInfos = userStoreService.useUserAuthInfo();

  useAuthFail();
  const { loading, refresh } = useRequest(
    async () => {
      const res = await SpaceApi.PublishConnectorList({
        bot_id: bot_id ?? '',
        commit_version,
      });
      return res;
    },
    {
      onBefore: () => {
        getPublishPlatformEvent.start();
      },
      onSuccess: data => {
        getPublishPlatformEvent.success();
        setConnectInfoList(data?.publish_connector_list);
        setConnectorBrandInfoMap(data?.connector_brand_info_map);
        setCanOpenSource(
          data?.submit_bot_market_option?.can_open_source ?? true,
        );
        setPublishTips(data?.publish_tips?.cost_tips ?? '');
      },
      onError: error => {
        getPublishPlatformEvent.error({ error, reason: error.message });
        errorHandler(error);
      },
      refreshDeps: [userAuthInfos],
    },
  );
  useReportTti({ isLive: !loading });
  const goBack = () => {
    navigate(`/space/${params.space_id}/bot/${params.bot_id}`);
  };

  const handlePublish = () => {
    publishRef.current?.publish();
  };

  const disabledTooltip = useMemo(() => {
    if (publishDisabled === PublishDisabledType.NotSelectCategory) {
      return I18n.t('publish_tooltip_select_category');
    } else if (publishDisabled === PublishDisabledType.NotSelectPlatform) {
      return I18n.t('publish_tooltip_select_platform');
    } else if (publishDisabled === PublishDisabledType.NotSelectIndustry) {
      return I18n.t('dy_avatar_evaluation_publish_tip');
    }
  }, [publishDisabled]);

  const publishBtn = (
    <UIButton
      theme="solid"
      //Resolve the error caused by clicking publish when the asynchronous request botInfo is not returned
      disabled={Boolean(publishDisabled) || !botInfo.name}
      loading={publishLoading}
      onClick={handlePublish}
      data-testid="agent-ide.publish-button"
    >
      {I18n.t('Publish')}
    </UIButton>
  );

  return (
    <UILayout title={`${botInfo?.name} - Publish`}>
      <UILayout.Header className={styles['publish-header']}>
        <div className={styles.header}>
          <div className="flex items-center">
            <BackButton onClickBack={goBack} />
            <div className={styles.title}>
              {I18n.t('card_builder_releaseBtn_release_btn')}
            </div>
          </div>
          {publishStatus === Publish.NoPublish ? (
            disabledTooltip ? (
              <Tooltip content={disabledTooltip}>{publishBtn}</Tooltip>
            ) : (
              publishBtn
            )
          ) : (
            <UIButton
              theme="solid"
              onClick={() => {
                goBack();
              }}
            >
              {I18n.t('bot_publish_success_back')}
            </UIButton>
          )}
        </div>
      </UILayout.Header>

      <UILayout.Content className={styles['publish-content']}>
        <PublishTableContext.Provider
          value={{
            publishLoading,
            refreshTableData: refresh,
          }}
        >
          <Spin spinning={loading} style={{ width: 800, margin: '0 auto' }}>
            {publishStatus === Publish.NoPublish ? (
              <PublishTable
                setPublishStatus={setPublishStatus}
                setPublishResult={setPublishResult}
                connectInfoList={connectInfoList ?? []}
                connectorBrandInfoMap={connectorBrandInfoMap ?? {}}
                botInfo={botInfo}
                monetizeConfig={monetizeConfig}
                publishTips={publishTips}
                getPublishDisabled={disabled => {
                  setPublishDisabled(disabled);
                }}
                getPublishLoading={pubLoading => setPublishLoading(pubLoading)}
                ref={publishRef}
                canOpenSource={canOpenSource}
              />
            ) : (
              <PublishResult publishResult={publishResult} />
            )}
          </Spin>
        </PublishTableContext.Provider>
      </UILayout.Content>
    </UILayout>
  );
};
