/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type NodeResult } from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';

interface Extra {
  response_extra: { variable_select: number[] };
}

/**
 * Determine whether it is an output variable according to the execution result
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
