import {
  type PluginPanelProps as BaseProps,
  PluginPanel,
} from '@coze-agent-ide/plugin-shared';

export type PluginPanelProps = Omit<BaseProps, 'slot'>;

export { PluginPanel };
