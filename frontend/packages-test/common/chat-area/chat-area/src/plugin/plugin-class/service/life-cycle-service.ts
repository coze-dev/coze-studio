import { type ChatAreaPlugin } from '../plugin';
import { type PluginMode } from '../../constants/plugin';

export abstract class LifeCycleService<
  U extends PluginMode = PluginMode.Readonly,
  T = unknown,
  K = unknown,
> {
  public pluginInstance: ChatAreaPlugin<U, T, K>;

  constructor(plugin: ChatAreaPlugin<U, T, K>) {
    this.pluginInstance = plugin;
  }
}

export abstract class ReadonlyLifeCycleService<
  T = unknown,
  K = unknown,
> extends LifeCycleService<PluginMode.Readonly, T, K> {}

export abstract class WriteableLifeCycleService<
  T = unknown,
  K = unknown,
> extends LifeCycleService<PluginMode.Writeable, T, K> {}
