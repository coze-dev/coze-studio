import { inject, injectable } from 'inversify';
import {
  WorkflowDocument,
  WorkflowSelectService,
} from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { WorkflowGlobalStateEntity } from '@/typing';

import { safeFn } from '../../utils';

/**
 * 全选快捷键
 */
@injectable()
export class WorkflowSelectAllShortcutsContribution
  implements WorkflowShortcutsContribution
{
  public static readonly type = 'SELECT_ALL';

  @inject(WorkflowDocument)
  private document: WorkflowDocument;
  @inject(WorkflowGlobalStateEntity)
  private globalState: WorkflowGlobalStateEntity;
  @inject(WorkflowSelectService)
  private selectService: WorkflowSelectService;
  /** 注册快捷键 */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowSelectAllShortcutsContribution.type,
      shortcuts: ['meta a', 'ctrl a'],
      isEnabled: () => !this.globalState.readonly,
      execute: safeFn(this.handle.bind(this)),
    });
  }
  private handle(): void {
    const nodes = this.document.root.blocks;
    this.selectService.selection = nodes;
  }
}
