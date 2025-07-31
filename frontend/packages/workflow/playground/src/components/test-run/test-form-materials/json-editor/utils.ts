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

import { type SchemaObject } from 'ajv';
import { type MonacoEditor } from '@coze-arch/bot-monaco-editor/types';

const getGlobalSchemas = (monaco: MonacoEditor) =>
  monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas || [];

/*  diagnosticsOptions is a global sharing configuration, and overwriting needs to be avoided in multi-instance scenarios */
export const setJsonSchema = (
  monaco: MonacoEditor,
  schema: SchemaObject,
  uri: string,
) => {
  monaco.languages.json.jsonDefaults.diagnosticsOptions;
  const schemas = getGlobalSchemas(monaco);

  // During local development, the monaco plug-in is commented out due to performance. You can manually add the plug-in back when developing related functions (apps/bot/edenx.config.ts)
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemaValidation: 'error',
    schemas: [
      ...schemas,
      {
        uri,
        fileMatch: [uri],
        schema,
      },
    ],
  });
};

export const clearJsonSchema = (monaco: MonacoEditor, uri: string) => {
  const schemas = getGlobalSchemas(monaco);
  const disposedSchema = schemas.filter(schema => schema.uri !== uri);

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    schemas: disposedSchema,
  });
};
