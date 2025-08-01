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

import { type SyncAction } from '../type';
import { primitiveExhaustiveCheck } from '../../../utils/exhaustive-check';
import { getMarkdownLink } from './get-markdown-link';

export const getSyncInsertText = (action: SyncAction): string => {
  const { type, payload } = action;
  if (type === 'link') {
    const { text, link } = payload;
    return getMarkdownLink({ text, link });
  }
  if (type === 'variable') {
    return payload.variableTemplate;
  }

  /**
   * Shouldn't have come here
   */
  primitiveExhaustiveCheck(type);
  return '';
};
