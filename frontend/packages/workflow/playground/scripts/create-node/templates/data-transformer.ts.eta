import { type NodeDataDTO } from '@coze-workflow/base';

import { type FormData } from './types';
import { OUTPUTS } from './constants';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (value: NodeDataDTO) => ({
  ...(value ?? {}),
  outputs: value?.outputs ?? OUTPUTS,
});

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData): NodeDataDTO =>
  value as unknown as NodeDataDTO;
