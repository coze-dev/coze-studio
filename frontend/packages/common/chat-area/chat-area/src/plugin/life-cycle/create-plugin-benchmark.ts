/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
