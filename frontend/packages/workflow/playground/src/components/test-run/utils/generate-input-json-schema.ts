import { type JSONEditorSchema } from '../test-form-materials/json-editor';

export interface JsonSchema {
  name: string;
  schema: JSONEditorSchema;
}
export { generateInputJsonSchema } from '@coze-workflow/variable';
