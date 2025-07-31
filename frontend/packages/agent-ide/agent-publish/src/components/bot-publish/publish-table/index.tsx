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
import { useParams } from 'react-router-dom';
import {
  type ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import {
  PublishDisabledType,
  type PublisherBotInfo,
  type PublishRef,
  type PublishResultInfo,
  STORE_CONNECTOR_ID,
  getPublishResult,
} from '@coze-agent-ide/space-bot';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEmpty,
  IconCozInfoCircleFill,
} from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { Form, Space, TextArea } from '@coze-arch/bot-semi';
import {
  AllowPublishStatus,
  type ConnectorBrandInfo,
  Publish,
  type PublishConnectorInfo,
  SpaceType,
} from '@coze-arch/bot-api/developer_api';
import { type BotMonetizationConfigData } from '@coze-arch/bot-api/benefit';
import { PublishTermService } from '@coze-agent-ide/agent-ide-commons';

import { TableCollection } from './table-collection';
import { useConnectorsPublish } from './hooks/use-connectors-publish';
import { getConnectorIsSelectable } from './get-connector-selectable';

import styles from './index.module.less';
export { PublishTableContext, usePublishTableContext } from './context';
interface PublishTableProps {
  setPublishStatus: (status: Publish) => void;
  setPublishResult: (result: PublishResultInfo) => void;
  connectInfoList: PublishConnectorInfo[];
  connectorBrandInfoMap: Record<string, ConnectorBrandInfo>;
  botInfo: PublisherBotInfo;
  monetizeConfig?: BotMonetizationConfigData;
  getPublishDisabled: (disabledType: PublishDisabledType) => void;
  getPublishLoading: (loading: boolean) => void;
  canOpenSource: boolean;
  publishTips?: string;
}

export const PublishTable = forwardRef(
  (
    {
      connectInfoList = [],
      connectorBrandInfoMap = {},
      setPublishStatus,
      setPublishResult,
      botInfo,
      monetizeConfig,
      getPublishDisabled,
      getPublishLoading,
      canOpenSource,
      publishTips,
    }: PublishTableProps,
    ref: ForwardedRef<PublishRef>,
  ) => {
    const publishId = useMemo(() => nanoid(), []);
    const [dataSource, setDataSource] =
      useState<PublishConnectorInfo[]>(connectInfoList);

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

    const { space_id: spaceId = '', bot_id: botId = '' } =
      useParams<DynamicParams>();

    const { space_type: spaceType } = useSpaceStore(s => s.space);
    const [changeLog, setChangeLog] = useState('');
    const [hasCategoryList, setHasCategoryList] = useState(true);
    const isPersonal = spaceType === SpaceType.Personal;

    useEffect(() => {
      if (connectInfoList?.length) {
        setDataSource(connectInfoList);
        const selectKeys = connectInfoList
          .filter(item => item.allow_punish === AllowPublishStatus.Allowed)
          .filter(item => getConnectorIsSelectable(item, botInfo))
          .map(node => node.id);
        setSelectedPlatforms(selectKeys);
      }
    }, [connectInfoList, botInfo]);

    useImperativeHandle(ref, () => ({
      publish: () => handlePublish(),
    }));

    const { loading: publishLoading, handlePublishBot } = useConnectorsPublish({
      onSuccess: resp => {
        setPublishStatus(Publish.HadPublished);
        const publishResult = getPublishResult(
          resp.publish_result ?? {},
          dataSource.filter(item => selectedPlatforms?.includes(item.id)),
        );
        setPublishResult({
          connectorResult: publishResult,
          marketResult: resp.submit_bot_market_result ?? {},
          monetizeConfigSuccess: resp.publish_monetization_result ?? false,
        });
      },
      botInfo,
    });

    const notSelectPlatform = !selectedPlatforms?.length;

    const notSelectCategory =
      hasCategoryList &&
      selectedPlatforms.includes(STORE_CONNECTOR_ID) &&
      !dataSource?.find(item => item.id === STORE_CONNECTOR_ID)?.bind_info
        ?.category_id;

    useEffect(() => {
      let publishDisableType;
      if (notSelectPlatform) {
        publishDisableType = PublishDisabledType.NotSelectPlatform;
      } else if (notSelectCategory) {
        publishDisableType = PublishDisabledType.NotSelectCategory;
      }

      getPublishDisabled(publishDisableType);
    }, [notSelectPlatform, notSelectCategory]);

    useEffect(() => {
      getPublishLoading(publishLoading);
    }, [publishLoading]);

    const handlePublish = () => {
      const connectors: Record<string, Record<string, string>> = {};
      const list = dataSource.filter(item =>
        selectedPlatforms.includes(item.id),
      );
      list.forEach(i => {
        connectors[i.id] = i.bind_info;
      });

      sendTeaEvent(EVENT_NAMES.bot_publish, {
        space_id: spaceId,
        bot_id: botId,
        publish_id: publishId,
        workspace_id: spaceId,
        workspace_type: isPersonal ? 'personal_workspace' : 'team_workspace',
        is_auto_gen_changelog_empty: true,
        is_changelog_empty: !changeLog,
        is_modified: false,
      });

      handlePublishBot({
        botId,
        connectors,
        changeLog,
        publishId,
      });
    };

    return (
      <div className={styles['publish-wrapper']}>
        <Form.Label
          text={I18n.t('bot_publish_changelog')}
          className={styles['text-label']}
        />
        <TextArea
          disabled={publishLoading}
          className={classNames(styles['text-area'])}
          value={changeLog}
          rows={3}
          showClear
          maxCount={2000}
          maxLength={2000}
          onChange={setChangeLog}
        />

        <Space className={styles['publish-title-container']}>
          <Form.Label required className={styles['publish-title']}>
            {I18n.t('bot_publish_select_title')}
          </Form.Label>

          {publishTips ? (
            <Tooltip content={publishTips}>
              <div className="coz-fg-hglt-yellow cursor-pointer text-[12px] font-[500]">
                <Space spacing={2}>
                  <IconCozInfoCircleFill />
                  <div>{I18n.t('coze_cost_sharing')}</div>
                </Space>
              </div>
            </Tooltip>
          ) : null}
        </Space>
        <PublishTermService
          termServiceData={dataSource
            .filter(item => item.privacy_policy || item.user_agreement)
            ?.map(i => ({
              name: i.name,
              icon: i.icon,
              privacy_policy: i.privacy_policy,
              user_agreement: i.user_agreement,
            }))}
        />
        {dataSource.length ? (
          <TableCollection
            dataSource={dataSource}
            connectorBrandInfoMap={connectorBrandInfoMap ?? {}}
            setSelectedPlatforms={setSelectedPlatforms}
            selectedPlatforms={selectedPlatforms}
            setDataSource={setDataSource}
            canOpenSource={canOpenSource}
            setHasCategoryList={setHasCategoryList}
            botInfo={botInfo}
            monetizeConfig={monetizeConfig}
            disabled={publishLoading}
          />
        ) : (
          <div className="flex flex-col justify-center items-center w-full h-full gap-[4px] mt-[80px]">
            <IconCozEmpty className="w-[32px] h-[32px] coz-fg-dim" />
            <div className="text-[14px] font-medium coz-fg-primary">
              {I18n.t('publish_page_no_channel_status_title')}
            </div>
            <div className="text-[12px] coz-fg-primary">
              {I18n.t('publish_page_no_channel_status_desc')}
            </div>
          </div>
        )}
      </div>
    );
  },
);
