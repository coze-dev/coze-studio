import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type TagColor } from '@coze-arch/bot-semi';
import {
  BindType,
  ConfigStatus,
  UserAuthStatus,
  type PublishConnectorInfo,
} from '@coze-arch/bot-api/developer_api';

interface ConfigStatusUI {
  text: string;
  color: TagColor;
}

export const getConfigStatus = (
  record: PublishConnectorInfo,
): ConfigStatusUI => {
  const { bind_type } = record;

  if (bind_type === BindType.KvBind) {
    return getKvBindStatus(record);
  }

  if (bind_type === BindType.AuthAndConfig) {
    return getAuthAndConfigStatus(record);
  }

  return getDefaultStatus(record);
};

const getKvBindStatus = (record: PublishConnectorInfo): ConfigStatusUI => {
  const { config_status } = record;
  const couldPublish = config_status === ConfigStatus.Configured;
  const color = couldPublish ? 'green' : 'grey';

  const textMap = {
    [ConfigStatus.Configured]: I18n.t('bot_publish_columns_status_configured'),
    [ConfigStatus.NotConfigured]: I18n.t(
      'bot_publish_columns_status_not_configured',
    ),
    // 配置的case暂时不会出现这个status，理论上这个case不会走到
    [ConfigStatus.Configuring]: '',
  };

  return {
    text: textMap[config_status],
    color,
  };
};

const getAuthAndConfigStatus = (
  record: PublishConnectorInfo,
): ConfigStatusUI => {
  const { config_status, auth_status } = record;
  if (auth_status === UserAuthStatus.UnAuthorized) {
    return {
      text: I18n.t('bot_publish_columns_status_unauthorized'),
      color: 'grey',
    };
  }
  switch (config_status) {
    case ConfigStatus.Configured:
      return {
        text: I18n.t('bot_publish_columns_status_configured'),
        color: 'green',
      };
    case ConfigStatus.NeedReconfiguring:
      return {
        text: I18n.t('publish_base_config_needReconfigure'),
        color: 'orange',
      };
    case ConfigStatus.NotConfigured:
      return {
        text: I18n.t('bot_publish_columns_status_not_configured'),
        color: 'grey',
      };
    default:
      reporter.errorEvent({
        eventName: 'fail_to_handle_config_status',
        error: new Error(`config status: ${config_status}`),
      });
      return {
        text: '',
        color: 'grey',
      };
  }
};

const getDefaultStatus = (record: PublishConnectorInfo): ConfigStatusUI => {
  const { config_status } = record;
  const couldPublish = config_status === ConfigStatus.Configured;
  const color = couldPublish ? 'green' : 'grey';

  const textMap = {
    [ConfigStatus.Configured]: I18n.t('bot_publish_columns_status_authorized'),
    [ConfigStatus.NotConfigured]: I18n.t(
      'bot_publish_columns_status_unauthorized',
    ),
    // 授权中
    [ConfigStatus.Configuring]: I18n.t('publish_douyin_config_ing'),
  };

  return {
    text: textMap[config_status],
    color,
  };
};
