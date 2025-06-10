import {
  inject,
  injectable,
  multiInject,
  optional,
  postConstruct,
} from 'inversify';
import { CommandRegistry } from '@flowgram-adapter/free-layout-editor';

interface ShorcutsHandler {
  commandId: string;
  shortcuts: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isEnabled?: (...args: any[]) => boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => void;
}

export const WorkflowShortcutsContribution = Symbol(
  'WorkflowShortcutsContribution',
);

export interface WorkflowShortcutsContribution {
  registerShortcuts: (registry: WorkflowShortcutsRegistry) => void;
}

@injectable()
export class WorkflowShortcutsRegistry {
  @multiInject(WorkflowShortcutsContribution)
  @optional()
  protected contribs: WorkflowShortcutsContribution[];
  @inject(CommandRegistry) protected commandRegistry: CommandRegistry;
  readonly shortcutsHandlers: ShorcutsHandler[] = [];
  addHandlers(...handlers: ShorcutsHandler[]): void {
    // 注册 command
    handlers.forEach(handler => {
      this.commandRegistry.registerCommand(
        { id: handler.commandId },
        { execute: handler.execute, isEnabled: handler.isEnabled },
      );
    });
    this.shortcutsHandlers.push(...handlers);
  }
  addHandlersIfNotFound(...handlers: ShorcutsHandler[]): void {
    handlers.forEach(handler => {
      if (!this.has(handler.commandId)) {
        this.addHandlers(handler);
      }
    });
  }
  has(commandId: string): boolean {
    return this.shortcutsHandlers.some(
      handler => handler.commandId === commandId,
    );
  }
  @postConstruct()
  protected init(): void {
    this.contribs?.forEach(contrib => contrib.registerShortcuts(this));
  }
}
