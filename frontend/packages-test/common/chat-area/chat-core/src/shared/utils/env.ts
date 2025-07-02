import { type ENV, type DeployVersion } from '../const';

/**
 * 获取 slardar 上报环境
 * 不同环境之间数据隔离
 * @returns
 */
export const getSlardarEnv = ({
  env,
  deployVersion,
}: {
  env: ENV;
  deployVersion: DeployVersion;
}) => [deployVersion, env].join('-');
