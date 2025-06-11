import { type Reporter } from '@coze-arch/logger';

import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin-class/plugin';
import {
  type LifeCycleScope,
  type AppLifeCycle,
  type CommandLifeCycle,
  type MessageLifeCycle,
  LifeCycleStage,
} from '../constants/plugin';

interface CreatePluginBenchmarkParams {
  lifeCycleName: AppLifeCycle | MessageLifeCycle | CommandLifeCycle;
  lifeCycleScope: LifeCycleScope;
  reporter?: Reporter;
}

const LUCKY_NUMBER = Math.random();

export const createPluginBenchmark = (params: CreatePluginBenchmarkParams) => {
  const { lifeCycleName, lifeCycleScope, reporter } = params;

  const enableReport = LUCKY_NUMBER <= 0.05;

  const { trace } =
    reporter?.tracer({
      eventName: 'chatAreaPluginCycleLifeBenchmark',
    }) ?? {};

  if (!trace || !enableReport) {
    return;
  }

  const recordLifeCycleStart = () =>
    trace(lifeCycleName, {
      meta: {
        lifeCycleScope,
        lifeCycleStage: LifeCycleStage.LifeCycleStart,
      },
    });

  const recordLifeCycleEnd = () =>
    trace(lifeCycleName, {
      meta: {
        lifeCycleScope,
        lifeCycleStage: LifeCycleStage.LifeCycleEnd,
      },
    });

  const recordPluginStart = (
    plugin: ReadonlyChatAreaPlugin<object> | WriteableChatAreaPlugin<object>,
  ) =>
    trace(lifeCycleName, {
      meta: {
        pluginName: plugin.pluginName,
        lifeCycleScope,
        lifeCycleStage: LifeCycleStage.PluginStart,
      },
    });

  const recordPluginEnd = (
    plugin: ReadonlyChatAreaPlugin<object> | WriteableChatAreaPlugin<object>,
  ) =>
    trace(lifeCycleName, {
      meta: {
        pluginName: plugin.pluginName,
        lifeCycleScope,
        lifeCycleStage: LifeCycleStage.PluginEnd,
      },
    });

  return {
    recordLifeCycleStart,
    recordLifeCycleEnd,
    recordPluginStart,
    recordPluginEnd,
  };
};
