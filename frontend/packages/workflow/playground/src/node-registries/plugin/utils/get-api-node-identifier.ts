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

import { isNil } from 'lodash-es';
import { type ApiNodeIdentifier } from '@coze-workflow/nodes';
import { BlockInput } from '@coze-workflow/base';

export function getApiNodeIdentifier(
  apiParam: BlockInput[],
): ApiNodeIdentifier {
  // Define the fields to be extracted and how they are converted
  const fieldsToExtract = [
    { name: 'apiName', key: 'apiName' },
    { name: 'pluginID', key: 'pluginID' },
    { name: 'apiID', key: 'api_id', optional: true },
    { name: 'pluginVersion', key: 'plugin_version', optional: true },
  ];

  // Using reduce to build the resulting object
  return fieldsToExtract.reduce((result, field) => {
    const blockInput = apiParam.find(
      (item: BlockInput) => item.name === field.name,
    );

    if (blockInput) {
      const value = BlockInput.toLiteral<string>(blockInput);
      if (!isNil(value)) {
        result[field.key] = value;
      }
    }
    return result;
  }, {} as unknown as ApiNodeIdentifier);
}
