import { type RightPanelConfigType } from '../../type';
import { ContextMenuConfigMap } from './constant';

/**
 * 主要替换资源树默认支持的 右键菜单配置，
 * 并且对三方注入的右键菜单的 id 进行包装
 */
export const handleConfig = (
  baseConfig: RightPanelConfigType[],
): RightPanelConfigType[] =>
  baseConfig.map(config => {
    if ('type' in config) {
      return config;
    }
    if (ContextMenuConfigMap[config.id]) {
      return {
        ...ContextMenuConfigMap[config.id],
        ...config,
        id: config.id,
      };
    }
    return {
      ...config,
      id: config.id,
    };
  });
