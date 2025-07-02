import { type FormMetaV2 } from '@flowgram-adapter/free-layout-editor';

import { createFormMeta } from '../create-form-meta';
import FormRender from './form-render';
import { DEFAULT_OUTPUTS } from './constants';

export const FORM_META: FormMetaV2 = createFormMeta({
  fieldConfig: {},
  needSyncConversationName: false,
  defaultInputValue: [],
  defaultOutputValue: DEFAULT_OUTPUTS,
  formRenderComponent: FormRender,
});
