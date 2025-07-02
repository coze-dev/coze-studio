import { parseExpression } from '../utils';
import { type SchemaExtractorExpressionParser } from '../type';
import type { ValueExpressionDTO } from '../../../types';
export const expressionParser: SchemaExtractorExpressionParser = expression => {
  const expressions = ([] as ValueExpressionDTO[])
    .concat(expression)
    .filter(Boolean);
  return expressions
    .map(parseExpression)
    .filter(Boolean) as ReturnType<SchemaExtractorExpressionParser>;
};
