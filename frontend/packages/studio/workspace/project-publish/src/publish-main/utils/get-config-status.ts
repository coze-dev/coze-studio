import {
  ConnectorBindType,
  ConnectorConfigStatus,
  type PublishConnectorInfo,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type TagProps } from '@coze-arch/coze-design';

interface ConfigStatusUI {
  text: string;
  color: TagProps['color'];
}

export const getConfigStatus = (
  record: PublishConnectorInfo,
): ConfigStatusUI => {
  const { bind_type } = record;

  if (
    bind_type === ConnectorBindType.KvBind ||
    bind_type === ConnectorBindType.KvAuthBind ||
    bind_type === ConnectorBindType.TemplateBind
  ) {
    return getKvBindStatus(record);
  }

  return getDefaultStatus(record);
};

const getKvBindStatus = (record: PublishConnectorInfo): ConfigStatusUI => {
  const { config_status = ConnectorConfigStatus.Configured } = record;

  const couldPublish = config_status === ConnectorConfigStatus.Configured;
  const color = couldPublish ? 'green' : 'primary';

  const textMap = {
    [ConnectorConfigStatus.Configured]: I18n.t(
      'bot_publish_columns_status_configured',
    ),
    [ConnectorConfigStatus.NotConfigured]: I18n.t(
      'bot_publish_columns_status_not_configured',
    ),
    // 业务不会走到下面3个case
    [ConnectorConfigStatus.Configuring]: '',
    [ConnectorConfigStatus.Disconnected]: '',
    [ConnectorConfigStatus.NeedReconfiguring]: '',
  };

  return {
    text: textMap[config_status],
    color,
  };
};

const getDefaultStatus = (record: PublishConnectorInfo): ConfigStatusUI => {
  const { config_status = ConnectorConfigStatus.Configured } = record;
  const couldPublish = config_status === ConnectorConfigStatus.Configured;
  const color = couldPublish ? 'green' : 'primary';

  const textMap = {
    [ConnectorConfigStatus.Configured]: I18n.t(
      'bot_publish_columns_status_authorized',
    ),
    [ConnectorConfigStatus.NotConfigured]: I18n.t(
      'bot_publish_columns_status_unauthorized',
    ),
    [ConnectorConfigStatus.Configuring]: I18n.t('publish_douyin_config_ing'),
    [ConnectorConfigStatus.Disconnected]: '',
    [ConnectorConfigStatus.NeedReconfiguring]: '',
  };

  return {
    text: textMap[config_status],
    color,
  };
};
