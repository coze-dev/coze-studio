/* eslint-disable @typescript-eslint/no-explicit-any */
import { isGlobalVariableKey } from '@coze-workflow/variable';
import { getSortedInputParameters } from '@coze-workflow/nodes';
import { ValueExpressionType } from '@coze-workflow/base';

import { isStaticObjectRef } from '@/components/test-run/utils/is-static-object-ref';

import type { WorkflowNodeEntity } from '../types';
import { generateInputToField } from './generate-input-to-field';

export const generateParametersToProperties = (
  parameters: any[],
  { node }: { node: WorkflowNodeEntity },
) => {
  if (!parameters || !Array.isArray(parameters)) {
    return {};
  }

  const fields = parameters.filter(i => {
    /** 对象引用类型不需要过滤，全是静态字段的需要过滤 */
    if (i.input?.type === ValueExpressionType.OBJECT_REF) {
      return !isStaticObjectRef(i);
    }
    /** 非引用类型直接过滤，引用值不存在直接过滤 */
    if (i.input?.type !== 'ref' || !i.input?.content) {
      return false;
    }
    /** 如果引用来自于自身，则不需要再填写 */
    const [nodeId] = i.input.content.keyPath || [];
    if (nodeId && nodeId === node.id) {
      return false;
    }
    if (isGlobalVariableKey(nodeId)) {
      return false;
    }

    return true;
  });
  const sortedFields = getSortedInputParameters(fields);

  return sortedFields
    .map(field => generateInputToField(field, { node }))
    .reduce((properties, field) => {
      if (field.name) {
        properties[field.name] = field;
      }
      return properties;
    }, {});
};
