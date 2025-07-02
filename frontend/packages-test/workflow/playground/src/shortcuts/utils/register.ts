import type { interfaces } from 'inversify';
import { bindContributions } from '@flowgram-adapter/common';
import type { WorkflowShortcutsContribution } from '@coze-workflow/render';

interface ShortcutFactory {
  new (): WorkflowShortcutsContribution;
}

export const bindShortcuts = (
  bind: interfaces.Bind,
  to: typeof WorkflowShortcutsContribution,
  shortcuts: ShortcutFactory[],
) => {
  shortcuts.forEach(shortcut => {
    bindContributions(bind, shortcut, [to]);
  });
};
