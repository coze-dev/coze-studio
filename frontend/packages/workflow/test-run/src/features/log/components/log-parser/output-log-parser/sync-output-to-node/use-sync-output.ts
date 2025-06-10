import { nanoid } from 'nanoid';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableTreeNode,
  type ViewVariableType,
  type ValueExpression,
} from '@coze-workflow/variable';

export type InputParams = Array<{
  name: string;
  input: ValueExpression;
}>;
export type OutputParams = ViewVariableTreeNode[];
export interface ParsedOutput {
  name: string;
  type: ViewVariableType;
  children?: ParsedOutput[];
}

export interface ParsedOutputWithKey extends ParsedOutput {
  key?: string;
}

const turnOutputParamsToMapDeep = (outputParams: OutputParams) => {
  const outputParamsMap: Record<string, ViewVariableTreeNode> = {};

  const recursiveLoopOutputParams = (output: OutputParams) => {
    output.forEach(item => {
      outputParamsMap[item.name] = item;
      if (item.children) {
        recursiveLoopOutputParams(item.children);
      }
    });
  };

  recursiveLoopOutputParams(outputParams);

  return outputParamsMap;
};

const updateOutputWithNewType = (
  outputParams: OutputParams,
  parsedOutput: ParsedOutput[],
) => {
  const oldOutputMap = turnOutputParamsToMapDeep(outputParams);

  const loopParsedOutput = (items: ParsedOutput[]) =>
    items.map(item => {
      const newItem: ParsedOutputWithKey = { ...item };

      if (oldOutputMap[item.name]) {
        newItem.key = oldOutputMap[item.name].key;
      } else {
        newItem.key = nanoid();
      }

      if (newItem.children) {
        newItem.children = loopParsedOutput(newItem.children);
      }

      return newItem;
    });

  return loopParsedOutput(parsedOutput);
};

export const useSyncOutput = (outputPath: string, node: FlowNodeEntity) => {
  // TODO: 改到 effects 中实现 ，依赖节点引擎支持自定义事件触发 effects cc @heyuan
  const updateOutput = (output: ParsedOutput[]) => {
    if (outputPath) {
      const formModel =
        node?.getData<FlowNodeFormData>(FlowNodeFormData).formModel;
      const outputFormItem = formModel?.getFormItemByPath(outputPath);
      if (outputFormItem) {
        outputFormItem.value = updateOutputWithNewType(
          outputFormItem.value,
          output,
        );
      }
    }
  };

  return updateOutput;
};
