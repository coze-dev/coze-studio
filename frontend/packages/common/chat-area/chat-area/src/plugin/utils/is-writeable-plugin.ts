import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin-class/plugin';
import { PluginMode } from '../constants/plugin';
import { type WriteableLifeCycleServicesAddition } from '../../store/plugins';

export const isWriteablePlugin = <T = unknown, K = unknown>(
  pluginInstance: ReadonlyChatAreaPlugin<T, K> | WriteableChatAreaPlugin<T, K>,
): pluginInstance is WriteableChatAreaPlugin<T, K> &
  WriteableLifeCycleServicesAddition<T, K> =>
  pluginInstance.pluginMode === PluginMode.Writeable;
