import { type ModelInfo } from '@coze-arch/bot-api/developer_api';
import { AutosaveManager } from '@coze-studio/autosave';

import { useModelStore, type ModelStore } from '@/store/model';
import { type BizKey } from '@/save-manager/types';

import { saveRequest } from '../request';
import { modelConfig } from './config';

export const modelSaveManager = new AutosaveManager<
  ModelStore,
  BizKey,
  ModelInfo
>({
  store: useModelStore,
  registers: [modelConfig],
  saveRequest,
});
