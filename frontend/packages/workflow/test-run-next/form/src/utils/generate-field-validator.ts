import Ajv from 'ajv';
import { I18n } from '@coze-arch/i18n';

import { type IFormSchemaValidate } from '../form-engine';

interface GenerateFieldValidatorOptions {
  name: string;
  title?: string;
  required?: boolean;
  validateJsonSchema?: any;
}

/**
 * ajv 实例缓存
 * 无需导入创建或者多次创建，优化内存开销
 */
let ajvCache: undefined | Ajv;

export const generateFieldValidator = (
  options: GenerateFieldValidatorOptions,
) => {
  const { required, title, name, validateJsonSchema } = options;

  const validator: IFormSchemaValidate = ({ value }) => {
    if (required && value === undefined) {
      return I18n.t('workflow_testset_required_tip', {
        param_name: title || name,
      });
    }
    // 如果有结构化描述，还需要对值进行反序列化校验
    if (validateJsonSchema && value !== undefined) {
      if (!ajvCache) {
        ajvCache = new Ajv();
      }
      try {
        const valueObject = JSON.parse(value);
        const validate = ajvCache.compile(validateJsonSchema);
        const valid = validate(valueObject);
        return valid ? undefined : I18n.t('workflow_debug_wrong_json');
      } catch {
        /**
         * 报错有多种可能，预期结果都是校验不通过
         * 1. 值反序列化失败
         * 2. 反序列化的值不合法
         */
        return I18n.t('workflow_debug_wrong_json');
      }
    }
  };

  return {
    ['x-validator']: validator,
  };
};
