import { inject, injectable } from 'inversify';
import { PlaygroundConfigEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowCommands } from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowShortcutsContribution,
  WorkflowShortcutsRegistry,
} from '@coze-workflow/render';

import { safeFn } from '../../utils';

/**
 * 缩放快捷键
 */
@injectable()
export class WorkflowZoomShortcutsContribution
  implements WorkflowShortcutsContribution
{
  @inject(PlaygroundConfigEntity)
  private playgroundConfig: PlaygroundConfigEntity;
  /** 注册快捷键 */
  public registerShortcuts(registry: WorkflowShortcutsRegistry): void {
    registry.addHandlers({
      commandId: WorkflowCommands.ZOOM_IN,
      shortcuts: ['meta =', 'ctrl ='],
      execute: safeFn(this.zoomIn.bind(this)),
    });
    registry.addHandlers({
      commandId: WorkflowCommands.ZOOM_OUT,
      shortcuts: ['meta -', 'ctrl -'],
      execute: safeFn(this.zoomOut.bind(this)),
    });
  }
  private zoomIn(): void {
    if (this.playgroundConfig.zoom > 1.9) {
      return;
    }
    this.playgroundConfig.zoomin();
  }
  private zoomOut(): void {
    if (this.playgroundConfig.zoom < 0.1) {
      return;
    }
    this.playgroundConfig.zoomout();
  }
}
