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

import { type Setter } from '@coze-workflow/setters';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import {
  type MessageVisibilityValue,
  type MessageVisibilitySetterOptions,
} from './types';
import { MessageVisibility } from './message-visibility';

export const MessageVisibilityWrapper: Setter<
  string,
  MessageVisibilitySetterOptions
> = props => {
  const { value, onChange } = props;

  const handleOnChange = (v: MessageVisibilityValue) => {
    onChange?.(JSON.stringify(v));
  };

  return (
    <MessageVisibility
      {...props}
      value={typeSafeJSONParse(value) ?? {}}
      onChange={handleOnChange}
    />
  );
};
