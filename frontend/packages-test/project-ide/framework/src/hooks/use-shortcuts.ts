import {
  useIDEService,
  ShortcutsService,
  CommandRegistry,
} from '@coze-project-ide/client';

export const useShortcuts = (commandId: string) => {
  const commandRegistry = useIDEService<CommandRegistry>(CommandRegistry);
  const shortcutsService = useIDEService<ShortcutsService>(ShortcutsService);

  const shortcut = shortcutsService.getShortcutByCommandId(commandId);
  const keybinding = shortcut.map(item => item.join(' ')).join('/');
  const label = commandRegistry.getCommand(commandId)?.label;

  return {
    keybinding,
    label,
  };
};
