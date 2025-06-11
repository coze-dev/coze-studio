import { ContainerModule } from 'inversify';
import { bindContributions } from '@flowgram-adapter/free-layout-editor';
import { WorkflowShortcutsContribution } from '@coze-workflow/render';

import { EncapsulateShortcutsContribution } from './encapsulate-shortcuts-contribution';
import { EncapsulateRenderService } from './encapsulate-render-service';

export const EncapsulateRenderContainerModule = new ContainerModule(bind => {
  bindContributions(bind, EncapsulateShortcutsContribution, [
    WorkflowShortcutsContribution,
  ]);
  bind(EncapsulateRenderService).toSelf().inSingletonScope();
});
