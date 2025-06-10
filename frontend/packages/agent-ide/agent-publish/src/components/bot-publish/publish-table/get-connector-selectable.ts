import { type PublisherBotInfo } from '@coze-agent-ide/space-bot';
import {
  BotConnectorStatus,
  ConfigStatus,
  UserAuthStatus,
  type PublishConnectorInfo,
  BindType,
} from '@coze-arch/bot-api/developer_api';

const getAuthAndConfigSelectable = (item: PublishConnectorInfo) =>
  Boolean(
    item.is_last_published &&
      item.connector_status === BotConnectorStatus.Normal &&
      item.config_status === ConfigStatus.Configured &&
      item.auth_status === UserAuthStatus.Authorized,
  );

const getKvBindSelectable = (item: PublishConnectorInfo) =>
  Boolean(
    item.is_last_published &&
      item.bind_info &&
      item.config_status !== ConfigStatus.Disconnected &&
      item.connector_status !== BotConnectorStatus.InReview,
  );

const getAuthBindOrKvAuthBindSelectable = (item: PublishConnectorInfo) =>
  Boolean(
    item.is_last_published &&
      item.config_status === ConfigStatus.Configured &&
      item.connector_status !== BotConnectorStatus.InReview,
  );

const getApiBindOrWebSDKBindSelectable = (item: PublishConnectorInfo) =>
  Boolean(
    item.is_last_published &&
      item.config_status === ConfigStatus.Configured &&
      item.connector_status === BotConnectorStatus.Normal,
  );

export const getConnectorIsSelectable = (
  item: PublishConnectorInfo,
  botInfo: PublisherBotInfo,
): boolean => {
  switch (item.bind_type) {
    case BindType.KvBind:
      return getKvBindSelectable(item);
    case BindType.AuthBind:
    case BindType.KvAuthBind:
      return getAuthBindOrKvAuthBindSelectable(item);
    case BindType.ApiBind:
    case BindType.WebSDKBind:
      return getApiBindOrWebSDKBindSelectable(item);
    case BindType.AuthAndConfig:
      return getAuthAndConfigSelectable(item);
    case BindType.StoreBind:
      return Boolean(!botInfo.hasPublished || item.is_last_published);
    default:
      return Boolean(
        item.is_last_published &&
          item.connector_status !== BotConnectorStatus.InReview,
      );
  }
};
