import Ajv from 'ajv';
import {
  variableUtils,
  generateInputJsonSchema,
} from '@coze-workflow/variable';
import { type ViewVariableMeta } from '@coze-workflow/base';
let ajv;
export const jsonSchemaValidator = (
  v: string,
  viewVariableMeta: ViewVariableMeta,
): boolean => {
  if (!viewVariableMeta || !v) {
    return true;
  }

  const dtoMeta = variableUtils.viewMetaToDTOMeta(viewVariableMeta);
  const jsonSchema = generateInputJsonSchema(dtoMeta);
  if (!jsonSchema) {
    return true;
  }
  if (!ajv) {
    ajv = new Ajv();
  }
  try {
    const validate = ajv.compile(jsonSchema);
    const valid = validate(JSON.parse(v));
    return valid;
    // eslint-disable-next-line @coze-arch/use-error-in-catch
  } catch (error) {
    // parse失败说明不是合法值
    return false;
  }
};
