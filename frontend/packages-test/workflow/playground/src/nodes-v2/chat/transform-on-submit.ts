import omit from 'lodash-es/omit';
import { type NodeDataDTO, type InputValueVO } from '@coze-workflow/base';

interface FormData {
  inputParameters: InputValueVO[];
}

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData): NodeDataDTO => {
  const formattedValue: Record<string, unknown> = {
    ...value,
    inputs: {
      inputParameters: value?.inputParameters || [],
    },
  };

  return omit(formattedValue, ['inputParameters']) as unknown as NodeDataDTO;
};
