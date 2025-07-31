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

import { get, isPlainObject } from 'lodash-es';

import { isWorkflowImageTypeURL } from '../utils';
import { type SchemaExtractorReferencesParser } from '../type';

interface Item {
  name: string;
  value: string;
  isImage: boolean;
}

interface ReferenceValue {
  type: string;
  value: {
    content: string;
  };
}

export const refInputParametersParser: SchemaExtractorReferencesParser =
  references => {
    const results: Item[] = [];
    for (const refObject of references) {
      const keys = Object.keys(refObject);
      for (const itemName of keys) {
        const itemValue = refObject[itemName];

        if (
          isPlainObject(itemValue) &&
          (itemValue as ReferenceValue)?.type === 'string'
        ) {
          const content = get(itemValue as ReferenceValue, 'value.content');
          results.push({
            name: itemName,
            value: content,
            isImage: isWorkflowImageTypeURL(content),
          });
        }
      }
    }

    return results;
  };
