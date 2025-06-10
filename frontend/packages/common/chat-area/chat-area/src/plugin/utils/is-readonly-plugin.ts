import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin-class/plugin';
import { PluginMode } from '../constants/plugin';
import { type ReadonlyLifeCycleServicesAddition } from '../../store/plugins';

export const isReadonlyPlugin = <T = unknown, K = unknown>(
  pluginInstance: ReadonlyChatAreaPlugin<T, K> | WriteableChatAreaPlugin<T, K>,
): pluginInstance is ReadonlyChatAreaPlugin<T, K> &
  ReadonlyLifeCycleServicesAddition<T, K> =>
  pluginInstance.pluginMode === PluginMode.Readonly;
