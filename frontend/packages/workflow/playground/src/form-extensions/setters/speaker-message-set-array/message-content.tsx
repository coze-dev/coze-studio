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

import { withField } from '@coze-arch/coze-design';

import { ExpressionEditorContainer } from '../expression-editor/container';

const MessageContent = props => {
  const { value, onChange, context, placeholder, validateStatus } = props;

  return (
    <ExpressionEditorContainer
      onChange={onChange}
      value={value}
      context={context}
      placeholder={placeholder}
      isError={validateStatus === 'error'}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MessageContentField: any = withField(MessageContent);
