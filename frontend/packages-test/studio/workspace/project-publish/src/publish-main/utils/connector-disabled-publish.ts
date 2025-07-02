import {
  type PublishConnectorInfo,
  ConnectorBindType,
  ConnectorConfigStatus,
} from '@coze-arch/idl/intelligence_api';

// 未配置/授权场景
export const getConnectorNotConfigured = (
  connector: PublishConnectorInfo,
): boolean => {
  const { bind_type, config_status } = connector;
  // 未绑定&未授权
  const notConfigured =
    [
      ConnectorBindType.KvBind,
      ConnectorBindType.AuthBind,
      ConnectorBindType.KvAuthBind,
      ConnectorBindType.TemplateBind, // mcp未配置时禁用，模版始终为已配置
    ].includes(bind_type) &&
    config_status === ConnectorConfigStatus.NotConfigured;
  return notConfigured;
};

// 不能发布的场景：
// 1. 未绑定&未授权
// 2. 后端下发的不能发布（如：没有workflow不能发api，有私有插件不能发模板，审核中不能发布的渠道）
export const getDisabledPublish = (
  connector: PublishConnectorInfo,
): boolean => {
  const { allow_publish } = connector;
  // 未绑定&未授权
  const notConfigured = getConnectorNotConfigured(connector);

  const connectorDisabled = notConfigured || !allow_publish;

  // 审核中不能发布渠道的场景后端下发 allow_publish
  return connectorDisabled;
};
