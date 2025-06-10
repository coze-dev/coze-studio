import { omit } from 'lodash-es';
import { nodeUtils } from '@coze-workflow/nodes';
import {
  type ValueExpression,
  type NodeDataDTO,
  ValueExpressionType,
} from '@coze-workflow/base';

import { getInputIsEmpty } from '../trigger-upsert/utils';
import { type FormData } from './types';
import { OUTPUTS } from './constants';

export const createTransformOnInit =
  outputs => (value: NodeDataDTO, context) => {
    if (!value) {
      return {
        inputs: {
          inputParameters: {
            triggerId: {
              type: ValueExpressionType.LITERAL,
            },
            userId: {
              type: ValueExpressionType.LITERAL,
            },
          },
        },
        outputs,
      };
    }
    const { inputs } = value;
    const inputParameters = {};

    (inputs?.inputParameters ?? []).forEach(item => {
      inputParameters[item.name as string] = nodeUtils.refExpressionDTOToVO(
        item,
        context,
      );
    });
    return {
      ...(value ?? {}),
      outputs: value?.outputs ?? outputs,
      inputs: {
        ...omit(value.inputs ?? {}, ['inputParameters']),
        inputParameters,
      },
    };
  };

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = createTransformOnInit(OUTPUTS);

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData, context): NodeDataDTO => {
  const { inputs, ...rest } = value;
  return {
    ...rest,
    inputs: {
      ...omit(value.inputs ?? {}, ['inputParameters']),
      inputParameters: Object.entries(inputs.inputParameters ?? {})
        .filter(([k, v]) => !!getInputIsEmpty(v))
        .map(([k, v]) => ({
          name: k,
          input: nodeUtils.refExpressionToValueDTO(
            v as unknown as ValueExpression,
            context,
          )?.input,
        })),
    },
  } as unknown as NodeDataDTO;
};
