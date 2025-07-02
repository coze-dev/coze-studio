import { type WriteableLifeCycleServiceGenerator } from '@coze-common/chat-area';

import { type PluginBizContext } from '../../types/biz-context';
import { renderLifeCycleServiceGenerator } from './render';
import { messageLifeCycleServiceGenerator } from './message';
import { commandLifeCycleServiceGenerator } from './command';
import { appLifeCycleServiceGenerator } from './app';

export const bizLifeCycleServiceGenerator: WriteableLifeCycleServiceGenerator<
  PluginBizContext
> = plugin => ({
  appLifeCycleService: appLifeCycleServiceGenerator(plugin),
  messageLifeCycleService: messageLifeCycleServiceGenerator(plugin),
  commandLifeCycleService: commandLifeCycleServiceGenerator(plugin),
  renderLifeCycleService: renderLifeCycleServiceGenerator(plugin),
});
