import { type FormMetaV2 } from '@flowgram-adapter/free-layout-editor';

import { createFormMeta } from '../create-form-meta';
import FormRender from './form-render';
import {
  DEFAULT_CONVERSATION_VALUE,
  DEFAULT_OUTPUTS,
  FIELD_CONFIG,
} from './constants';

export const FORM_META: FormMetaV2 = createFormMeta({
  fieldConfig: FIELD_CONFIG,
  needSyncConversationName: false,
  defaultInputValue: DEFAULT_CONVERSATION_VALUE,
  defaultOutputValue: DEFAULT_OUTPUTS,
  formRenderComponent: FormRender,
});
