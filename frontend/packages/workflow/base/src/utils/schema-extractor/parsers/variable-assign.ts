import { type SchemaExtractorVariableAssignParser } from '../type';
import { type ValueExpressionDTO, type DTODefine } from '../../../types';

const getValueExpressionName = (
  valueExpression: ValueExpressionDTO,
): string | undefined => {
  const content = valueExpression?.value?.content as
    | DTODefine.RefExpressionContent
    | string;
  if (!content) {
    return;
  }
  if (typeof content === 'string') {
    return content;
  } else if (typeof content === 'object') {
    if (content.source === 'block-output' && typeof content.name === 'string') {
      return content.name;
    } else if (
      typeof content.source === 'string' &&
      content.source.startsWith('global_variable')
    ) {
      return (
        content as {
          source: `global_variable_${string}`;
          path: string[];
          blockID: string;
          name: string;
        }
      )?.path?.join('.');
    }
  }
};

export const variableAssignParser: SchemaExtractorVariableAssignParser =
  variableAssigns => {
    if (!Array.isArray(variableAssigns)) {
      return [];
    }

    return variableAssigns
      .map(variableAssign => {
        const leftContent = getValueExpressionName(variableAssign.left);
        const rightContent = getValueExpressionName(variableAssign.right);
        // 变量赋值节点的右值字段
        const inputContent = variableAssign.input
          ? getValueExpressionName(variableAssign.input)
          : null;
        return {
          name: leftContent ?? '',
          value: rightContent ?? inputContent ?? '',
        };
      })
      .filter(Boolean) as ReturnType<SchemaExtractorVariableAssignParser>;
  };
