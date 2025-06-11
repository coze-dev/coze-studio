import type {
  InputValueVO,
  NodeDataDTO,
  OutputValueVO,
} from '@coze-workflow/base';

export interface FormData {
  nodeMeta: NodeDataDTO['nodeMeta'];
  mode: 'set' | 'get';
  inputParameters: InputValueVO[];
  outputs: OutputValueVO[];
}
