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

import { parseExpression } from '../utils';
import { type SchemaExtractorDbFieldsParser } from '../type';
export const dbFieldsParser: SchemaExtractorDbFieldsParser = dbFields =>
  dbFields
    ?.map(([fieldID, fieldValue]) => {
      const parsedFieldID = parseExpression(fieldID?.input);
      const parsedFieldValue = parseExpression(fieldValue?.input);
      if (!parsedFieldValue) {
        return null;
      }

      return {
        name: parsedFieldID?.value,
        value: parsedFieldValue?.value,
        isImage: parsedFieldValue?.isImage,
      };
    })
    ?.filter(Boolean) as ReturnType<SchemaExtractorDbFieldsParser>;
