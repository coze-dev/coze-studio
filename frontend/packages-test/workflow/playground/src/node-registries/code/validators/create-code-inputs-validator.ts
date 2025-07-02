import { type Validate } from '@flowgram-adapter/free-layout-editor';

import { createInputTreeValidator } from '../../common/validators/create-input-tree-validator';

export function createCodeInputsValidator(): { [key: string]: Validate } {
  return {
    inputParameters: createInputTreeValidator(),
  };
}
