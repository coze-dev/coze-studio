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

import { I18n } from '@coze-arch/i18n';
import { type Validate } from '@flowgram-adapter/free-layout-editor';
export interface CreateAnswerContentValidatorOptions {
  fieldEnabled?: (...props: Parameters<Validate>) => boolean;
}
export const createAnswerContentValidator =
  (options?: CreateAnswerContentValidatorOptions): Validate<string> =>
  props => {
    if (options?.fieldEnabled && !options?.fieldEnabled?.(props)) {
      return;
    }
    const { value } = props;
    if (!value) {
      return I18n.t('workflow_detail_node_error_empty');
    }
  };
