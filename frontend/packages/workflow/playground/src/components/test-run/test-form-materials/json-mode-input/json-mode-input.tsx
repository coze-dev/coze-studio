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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';

import {
  FormBaseInputJson,
  type IFormSchema,
} from '@coze-workflow/test-run-next';

import { useGlobalState } from '@/hooks';

import { getExtensions } from './get-extensions';

interface JsonModeInputProps {
  properties: IFormSchema['properties'];
  validateJsonSchema: any;
}

export const JsonModeInput: React.FC<JsonModeInputProps> = ({
  properties,
  validateJsonSchema,
  ...props
}) => {
  const globalState = useGlobalState();
  const editorRef = useRef();
  const extensionsRef = useRef(
    getExtensions({
      properties,
      spaceId: globalState.spaceId,
      editorRef,
    }),
  );
  return (
    <FormBaseInputJson
      jsonSchema={validateJsonSchema}
      extensions={extensionsRef.current}
      height="364px"
      didMount={editor => {
        editorRef.current = editor;
      }}
      {...props}
    />
  );
};
