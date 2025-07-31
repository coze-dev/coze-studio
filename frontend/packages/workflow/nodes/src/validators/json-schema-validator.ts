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

import Ajv from 'ajv';
import {
  variableUtils,
  generateInputJsonSchema,
} from '@coze-workflow/variable';
import { type ViewVariableMeta } from '@coze-workflow/base';
let ajv;
export const jsonSchemaValidator = (
  v: string,
  viewVariableMeta: ViewVariableMeta,
): boolean => {
  if (!viewVariableMeta || !v) {
    return true;
  }

  const dtoMeta = variableUtils.viewMetaToDTOMeta(viewVariableMeta);
  const jsonSchema = generateInputJsonSchema(dtoMeta);
  if (!jsonSchema) {
    return true;
  }
  if (!ajv) {
    ajv = new Ajv();
  }
  try {
    const validate = ajv.compile(jsonSchema);
    const valid = validate(JSON.parse(v));
    return valid;
    // eslint-disable-next-line @coze-arch/use-error-in-catch
  } catch (error) {
    // Parse failure indicates that it is not a legal value
    return false;
  }
};
