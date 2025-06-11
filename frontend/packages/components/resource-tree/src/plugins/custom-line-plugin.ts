import {
  bindConfigEntity,
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/fixed-layout-editor';

import {
  CustomLinesManager,
  CustomHoverService,
  TreeService,
} from '../services';
import { CustomRenderStateConfigEntity } from '../entities';

export const createCustomLinesPlugin: PluginCreator<any> =
  definePluginCreator<any>({
    onBind: ({ bind }) => {
      bind(CustomLinesManager).toSelf().inSingletonScope();
      bind(CustomHoverService).toSelf().inSingletonScope();
      bind(TreeService).toSelf().inSingletonScope();
      bindConfigEntity(bind, CustomRenderStateConfigEntity);
    },
  });
