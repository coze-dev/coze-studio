import { type createChatAreaPluginContext } from '../../plugin-context';
import { type PluginMode } from '../../constants/plugin';

export type WriteableChatAreaPluginContext = ReturnType<
  typeof createChatAreaPluginContext
>;

export type ReadonlyChatAreaPluginContext = Omit<
  WriteableChatAreaPluginContext,
  'writeableAPI' | 'writeableHook'
>;

export type ChatAreaPluginContext<T extends PluginMode = PluginMode.Readonly> =
  T extends PluginMode.Readonly
    ? ReadonlyChatAreaPluginContext
    : WriteableChatAreaPluginContext;
