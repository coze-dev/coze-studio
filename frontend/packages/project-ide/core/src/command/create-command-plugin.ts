import { pick } from '@flowgram-adapter/common';
import {
  CommandContainerModule,
  type Command,
  type CommandHandler,
  CommandRegistry,
} from '@flowgram-adapter/common';

import { definePluginCreator } from '../common';

export interface CommandPluginOptions {
  commands?: (Command & Partial<CommandHandler>)[];
}

export const createCommandPlugin = definePluginCreator<CommandPluginOptions>({
  onInit: (ctx, options) => {
    const command = ctx.get<CommandRegistry>(CommandRegistry);
    command.init();
    (options.commands || []).forEach(cmd => {
      command.registerCommand(
        pick(cmd, ['id', 'label', 'icon', 'category']),
        cmd.execute
          ? pick(cmd, ['execute', 'isEnabled', 'isVisible', 'isToggled'])
          : undefined,
      );
    });
  },
  containerModules: [CommandContainerModule],
});
