import {
  definePluginCreator,
  type PluginCreator,
} from '@flowgram-adapter/free-layout-editor';

import { TestFormService, TestFormServiceImpl } from './test-form-service';

export const createTestRunPlugin: PluginCreator<object> =
  definePluginCreator<object>({
    onBind({ bind }) {
      bind(TestFormService).to(TestFormServiceImpl).inSingletonScope();
    },
  });
