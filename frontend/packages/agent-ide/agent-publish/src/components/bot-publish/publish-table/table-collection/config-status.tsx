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

import { I18n } from '@coze-arch/i18n';
import {
  Tag,
  Tooltip,
  Space,
  UITag,
  type UITagProps,
} from '@coze-arch/bot-semi';
import { IconInfoCircle } from '@coze-arch/bot-icons';
import {
  AllowPublishStatus,
  BindType,
  BotConnectorStatus,
  ConfigStatus,
  UserAuthStatus,
  type PublishConnectorInfo,
} from '@coze-arch/bot-api/developer_api';
import {
  KvBindButton,
  DiffViewButton,
  AuthorizeButton,
} from '@coze-agent-ide/space-bot/component';
import { type ActionColumnProps } from '@coze-agent-ide/space-bot';

import styles from '../index.module.less';
import { useAuthSuccess } from './hooks/use-auth-success';
import { getConfigStatus } from './get-config-status';
import { StoreBind, ApiBindButton } from './connector-action';

interface TipTagProps {
  showText: string;
  tip: string;
  tagProps?: UITagProps;
}

const TipTag: React.FC<TipTagProps> = ({ showText, tip, tagProps }) => (
  <Tooltip content={tip}>
    {showText ? (
      <Tag className={styles['orange-tag']} color="orange" {...tagProps}>
        {showText}
        <IconInfoCircle />
      </Tag>
    ) : (
      <IconInfoCircle className={styles['grey-info']} />
    )}
  </Tooltip>
);

export const PublishConnectorAction: React.FC<ActionColumnProps> = ({
  record,
  setSelectedPlatforms,
  setDataSource,
  canOpenSource,
  botInfo,
  isMouseIn,
  selectedPlatforms,
  setHasCategoryList,
  dataSource,
}) => {
  const revokeSuccess = (id: string) => {
    setDataSource((list: PublishConnectorInfo[]) => {
      const target = list.find(item => item.id === id);
      if (target) {
        target.config_status = ConfigStatus.NotConfigured;
        target.config_status_toast = undefined;
        target.auth_status = UserAuthStatus.UnAuthorized;
      }

      return [...list];
    });
    setSelectedPlatforms(list => list.filter(i => i !== id));
  };

  useAuthSuccess((id: string) => {
    const currentConnectorInfo = dataSource.find(item => item.id === id);
    if (
      currentConnectorInfo?.allow_punish === AllowPublishStatus.Allowed &&
      currentConnectorInfo?.connector_status === BotConnectorStatus.Normal &&
      currentConnectorInfo?.config_status === ConfigStatus.Configured
    ) {
      setSelectedPlatforms(list => [...list, id]);
    }
  });

  const action = (() => {
    switch (record.bind_type) {
      case BindType.KvBind: //bind only
      case BindType.KvAuthBind: //Bind + authorization, automatically cancel the authorization after unbinding
        return (
          <KvBindButton
            record={record}
            setDataSource={setDataSource}
            setSelectedPlatforms={setSelectedPlatforms}
          />
        );
      case BindType.AuthBind:
        return record.auth_login_info ? (
          <AuthorizeButton
            origin="publish"
            id={record.id}
            channelName={record.name}
            status={record.config_status}
            revokeSuccess={revokeSuccess}
            authInfo={record.auth_login_info}
            isMouseIn={isMouseIn}
          />
        ) : null;
      case BindType.ApiBind:
        return <ApiBindButton />;
      case BindType.StoreBind:
        return (
          <StoreBind
            record={record}
            canOpenSource={canOpenSource}
            setDataSource={setDataSource}
            botInfo={botInfo}
            selectedPlatforms={selectedPlatforms}
            setHasCategoryList={setHasCategoryList}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <div className="mr-7 flex gap-[8px]" onClick={e => e.stopPropagation()}>
      {record.config_status !== ConfigStatus.NotConfigured && (
        <DiffViewButton record={record} isMouseIn={isMouseIn} />
      )}
      {action}
    </div>
  );
};

export const ConfigStatusColumn: React.FC<ActionColumnProps> = props => {
  const { record } = props;

  if (record.config_status === ConfigStatus.Disconnected) {
    return (
      <Space>
        <TipTag
          showText={I18n.t('bot_publish_columns_status_disconnected')}
          tip={I18n.t('bot_publish_token_expired_notice', {
            platform: record.name,
          })}
        />
        <PublishConnectorAction {...props} />
      </Space>
    );
  }

  const { text, color } = getConfigStatus(record);

  return (
    <Space
      className={styles['config-status']}
      style={{ justifyContent: 'space-between', width: '100%' }}
    >
      <div>
        {record?.config_status_toast ? (
          <TipTag
            showText={text}
            tip={record?.config_status_toast || ''}
            tagProps={{
              color,
              style: { margin: 0 },
              // Overwrite the original orange-tag.
              className: styles['common-tag'],
            }}
          />
        ) : (
          <UITag color={color}>{text}</UITag>
        )}
        {record?.connector_status === BotConnectorStatus.Normal ? null : (
          <TipTag
            showText={
              record?.connector_status === BotConnectorStatus.InReview
                ? I18n.t('bot_publish_columns_status_in_review')
                : I18n.t('bot_publish_columns_status_offline')
            }
            tip={
              record?.connector_status === BotConnectorStatus.InReview
                ? I18n.t('bot_publish_in_review_notice')
                : I18n.t('bot_publish_offline_notice_no_certain_time', {
                    platform: record?.name,
                  })
            }
          />
        )}
      </div>
      <PublishConnectorAction {...props} />
    </Space>
  );
};
