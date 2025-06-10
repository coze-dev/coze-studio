import { variableUtils } from '@coze-workflow/variable';

import { type FormData, type NodeDataDTO } from './types';

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData): NodeDataDTO =>
  ({
    ...value,
    inputs: {
      outputSchema: JSON.stringify(
        value.outputs?.map(o => variableUtils.viewMetaToDTOMeta(o)) || [],
      ),
    },
  }) as unknown as NodeDataDTO;
