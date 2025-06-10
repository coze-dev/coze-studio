import {
  type OutputValueVO,
  type InputValueVO,
  type NodeDataDTO,
} from '@coze-workflow/base';

import { type CodeEditorValue } from '@/form-extensions/setters/code/types';

export interface FormData {
  inputParameters: InputValueVO[];
  nodeMeta: NodeDataDTO['nodeMeta'];
  outputs: OutputValueVO[];
  codeParams: CodeEditorValue;
}
