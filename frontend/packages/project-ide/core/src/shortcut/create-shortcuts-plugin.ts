import { definePluginCreator } from '../common';
import { type ShortcutsHandler, ShortcutsService } from './shortcuts-service';
import { ShortcutsContainerModule } from './shortcuts-container-module';

export interface ShortcutsPluginOptions {
  shortcuts?: ShortcutsHandler[];
}

export const createShortcutsPlugin =
  definePluginCreator<ShortcutsPluginOptions>({
    onInit: (ctx, options) => {
      const shortcuts = ctx.get<ShortcutsService>(ShortcutsService);
      shortcuts.registerHandlers(...(options.shortcuts || []));
    },
    containerModules: [ShortcutsContainerModule],
  });
