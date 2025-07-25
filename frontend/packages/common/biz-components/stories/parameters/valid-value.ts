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
 
import { z, ZodError, type ZodSchema } from 'zod';

import type { ParameterValue, ParametersError } from '../../src';

interface SimpleParamTypeAlias {
  name: string;
  children?: SimpleParamTypeAlias[];
}

// 使用 zod 创建校验规则，只校验 name 和 description
const createParameterValueSchema = (): ZodSchema<SimpleParamTypeAlias> =>
  z.lazy(() =>
    z.object({
      name: z.string().min(1, { message: 'Name cannot be empty' }),
      children: z.array(createParameterValueSchema()).optional(),
    }),
  );

const parametersValueSchema = z.array(createParameterValueSchema());

// 定义 validValue 函数，使用 zod 进行校验
export default function validValue(
  values: ParameterValue[],
): ParametersError[] | undefined {
  try {
    parametersValueSchema.parse(values);
  } catch (error) {
    if (error instanceof ZodError) {
      return error.errors.map(({ path, message }) => ({
        path: String(path).replaceAll(',', '.'),
        message,
      }));
    }

    throw error;
  }
}
