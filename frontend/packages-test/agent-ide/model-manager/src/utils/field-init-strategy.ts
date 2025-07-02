import type { DataField, Form, GeneralField } from '@formily/core';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import {
  ModelStyle,
  type ModelParameter,
} from '@coze-arch/bot-api/developer_api';

import { type FormilyCoreType } from '../context/formily-context/type';

interface FieldInitStrategy {
  execute: (parameter: ModelParameter, formilyCore: FormilyCoreType) => void;
}

/**
 * 用户修改模型“生成多样性”参数时，切换为“自定义”模式
 */
class CustomModelStyleStrategy implements FieldInitStrategy {
  handler: (_field: DataField, form: Form) => void = (_field, form) =>
    form.setValues({ model_style: ModelStyle.Custom });

  execute: FieldInitStrategy['execute'] = (
    param,
    { onFieldInputValueChange },
  ) => {
    if (param.param_class?.class_id === 1) {
      onFieldInputValueChange(param.name, this.handler);
    }
  };
}

function isDataField(field: GeneralField): field is DataField {
  return Object.prototype.hasOwnProperty.call(field, 'value');
}

/**
 * 当某个字段值小于阈值时，使用 field.feedbacks 显示提示文案
 * https://core.formilyjs.org/zh-CN/api/models/field#ifieldfeedback
 */
class MinimumValueStrategy implements FieldInitStrategy {
  constructor(
    private name: string,
    private min: number,
    private i18nKey: I18nKeysNoOptionsType,
  ) {}

  validator: (field: GeneralField, _form: Form) => void = (field, _form) => {
    if (isDataField(field)) {
      field.setSelfWarnings(
        (field.value ?? 0) < this.min ? [I18n.t(this.i18nKey)] : undefined,
      );
    }
  };

  execute: FieldInitStrategy['execute'] = (
    param,
    { onFieldInit, onFieldValueChange },
  ) => {
    if (param.name === this.name) {
      onFieldInit(this.name, this.validator);
      onFieldValueChange(this.name, this.validator);
    }
  };
}

export const fieldInitStrategies = [
  new CustomModelStyleStrategy(),
  // 重复语句惩罚 < 0 时，显示提示文案
  new MinimumValueStrategy('frequency_penalty', 0, 'model_setting_alert'),
  // 最大回复长度 < 100 时，显示提示文案
  new MinimumValueStrategy('max_tokens', 100, 'model_setting_alert_2'),
];
