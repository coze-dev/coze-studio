import omit from 'lodash-es/omit';
import {
  type InputValueVO,
  type ViewVariableTreeNode,
  type NodeDataDTO,
} from '@coze-workflow/base';

const isEmptyArrayOrNil = (value: unknown) =>
  // eslint-disable-next-line eqeqeq
  (Array.isArray(value) && value.length === 0) || value == null;
/**
 * 节点后端数据 -> 前端表单数据
 */
export const createTransformOnInit =
  (
    defaultInputValue: InputValueVO[] = [],
    defaultOutputValue: ViewVariableTreeNode[] = [],
  ) =>
  (value: NodeDataDTO) => {
    const { inputs, outputs } = value || {};
    const inputParameters = inputs?.inputParameters || [];

    // 由于在提交时，会将没有填值的变量给过滤掉，所以需要在初始化时，将默认值补充进来
    // 参见：packages/workflow/nodes/src/workflow-json-format.ts:241
    const refillInputParamters = defaultInputValue.map(cur => {
      const { name } = cur;
      const target = inputParameters.find(item => item.name === name);
      if (target) {
        return target;
      }
      return cur;
    }, []);

    const initValue = {
      ...omit(value, ['inputs']),
      inputParameters: refillInputParamters,
      outputs: isEmptyArrayOrNil(outputs) ? defaultOutputValue : outputs,
    };

    return initValue;
  };
