import { type NodeResult } from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';

interface Extra {
  response_extra: { variable_select: number[] };
}

/**
 * 根据执行结果判断是不是输出的变量
 * @param ref
 * @param result
 * @returns
 */
export function isOutputVariable(
  groupIndex: number,
  variableIndex: number,
  result: NodeResult | undefined,
): boolean {
  if (!result || !result.extra) {
    return false;
  }

  try {
    const extra = JSON.parse(result.extra) as Extra;

    if (!extra?.response_extra?.variable_select) {
      return false;
    }

    return extra.response_extra.variable_select[groupIndex] === variableIndex;
  } catch (error) {
    logger.error(error);
  }

  return !!result;
}
