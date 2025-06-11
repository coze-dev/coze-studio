import {
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/free-layout-editor';

import { WorkflowEncapsulateContainerModule } from './workflow-encapsulate-container-module';
import { EncapsulateValidatorsContainerModule } from './validators';
import { EncapsulateValidateManager } from './validate';
import {
  type GetGlobalStateOption,
  type GetNodeTemplateOption,
  type OnEncapsulateOption,
} from './types';
import { EncapsulateRenderContainerModule } from './render';
import { EncapsulateContext } from './encapsulate-context';
import { EncapsulateManager, EncapsulateService } from './encapsulate';

interface EncapsulatePluginOptions {
  getNodeTemplate?: GetNodeTemplateOption;
  getGlobalState?: GetGlobalStateOption;
  onEncapsulate?: OnEncapsulateOption;
}

export const createWorkflowEncapsulatePlugin: PluginCreator<EncapsulatePluginOptions> =
  definePluginCreator<EncapsulatePluginOptions>({
    onInit(ctx, options) {
      ctx.get<EncapsulateManager>(EncapsulateManager).init();

      ctx.get<EncapsulateContext>(EncapsulateContext).setPluginContext(ctx);

      if (options.getNodeTemplate) {
        ctx
          .get<EncapsulateContext>(EncapsulateContext)
          .setGetNodeTemplate(options.getNodeTemplate);
      }

      if (options.getGlobalState) {
        ctx
          .get<EncapsulateContext>(EncapsulateContext)
          .setGetGlobalState(options.getGlobalState);
      }

      if (options.onEncapsulate) {
        ctx.get<EncapsulateService>(EncapsulateService).onEncapsulate(res => {
          options?.onEncapsulate?.(res, ctx);
        });
      }
    },
    onDispose(ctx) {
      ctx.get<EncapsulateValidateManager>(EncapsulateValidateManager).dispose();
      ctx.get<EncapsulateService>(EncapsulateService).dispose();
      ctx.get<EncapsulateManager>(EncapsulateManager).dispose();
    },
    containerModules: [
      WorkflowEncapsulateContainerModule,
      EncapsulateRenderContainerModule,
      EncapsulateValidatorsContainerModule,
    ],
  });
