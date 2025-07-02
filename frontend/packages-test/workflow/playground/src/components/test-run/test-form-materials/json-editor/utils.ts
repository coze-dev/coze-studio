import { type SchemaObject } from 'ajv';
import { type MonacoEditor } from '@coze-arch/bot-monaco-editor/types';

const getGlobalSchemas = (monaco: MonacoEditor) =>
  monaco.languages.json.jsonDefaults.diagnosticsOptions.schemas || [];

/*  diagnosticsOptions 是全局共享配置，多实例场景下需要避免覆盖 */
export const setJsonSchema = (
  monaco: MonacoEditor,
  schema: SchemaObject,
  uri: string,
) => {
  monaco.languages.json.jsonDefaults.diagnosticsOptions;
  const schemas = getGlobalSchemas(monaco);

  // 本地开发时由于性能将monaco插件注释掉了，开发相关功能时可以手动把插件加回来 (apps/bot/edenx.config.ts)
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
