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

import { isNumber } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { InputComponentType } from '@coze-arch/bot-api/connector_api';

import {
  type BaseOutputStructLineType,
  type FeishuBaseConfigFe,
  type InputConfigFe,
} from '../types';
import { INPUT_CONFIG_TEXT_MAX_CHAR } from '../constants';
import {
  getIsSelectType,
  getIsStructOutput,
  verifyOutputStructFieldAsGroupByKey,
  verifyOutputStructFieldAsPrimaryKey,
} from './utils';

export const validateFullConfig = (config: FeishuBaseConfigFe): boolean => {
  if (!validateOutputConfig(config)) {
    return false;
  }
  const inputValid = validateInputConfig(config);
  // console.log('inputValid', inputValid);
  return inputValid;
};

const validateOutputConfig = (config: FeishuBaseConfigFe) => {
  if (!getIsStructOutput(config.output_type)) {
    return isNumber(config.output_type);
  }
  const structFields = config.output_sub_component.item_list || [];
  const structPatternVerified = validateOutputStructPattern(structFields);
  if (!structPatternVerified) {
    return false;
  }
  return validateOutputStructGroupByKeyAndPrimaryKey(structFields);
};

const validateOutputStructPattern = (
  structFields: BaseOutputStructLineType[],
) => {
  if (structFields.length < 1) {
    return false;
  }
  return structFields.every(
    field => !!field.key && isNumber(field.output_type),
  );
};

const validateOutputStructGroupByKeyAndPrimaryKey = (
  structFields: BaseOutputStructLineType[],
): boolean => {
  const groupByKeyVerifyRes = validateOutputStructGroupByKey(structFields);
  if (!groupByKeyVerifyRes.ok) {
    return false;
  }
  const primaryKeyVerifyRes = validateOutputStructPrimaryKey(structFields);
  return primaryKeyVerifyRes.ok;
};

interface StructOutputGroupByOrPrimaryKeyVerifyRes {
  ok: boolean;
  error: string;
}

export const validateOutputStructGroupByKey = (
  structFields: BaseOutputStructLineType[],
): StructOutputGroupByOrPrimaryKeyVerifyRes => {
  const fields = structFields.filter(field => field.is_group_by_key);
  if (fields.length > 1) {
    return {
      ok: false,
      error: I18n.t('publish_base_configFields_requiredWarn'),
    };
  }
  const field = fields.at(0);
  if (!field) {
    return {
      ok: false,
      error: I18n.t('publish_base_configFields_requiredWarn'),
    };
  }
  if (!verifyOutputStructFieldAsGroupByKey(field)) {
    return {
      ok: false,
      error: '',
    };
  }
  return { ok: true, error: '' };
};

export const validateOutputStructPrimaryKey = (
  structFields: BaseOutputStructLineType[],
): StructOutputGroupByOrPrimaryKeyVerifyRes => {
  const fields = structFields.filter(field => field.is_primary);
  if (fields.length > 1) {
    return {
      ok: false,
      error: I18n.t('publish_base_configFields_requiredWarn'),
    };
  }
  const field = fields.at(0);
  if (!field) {
    return {
      ok: false,
      error: I18n.t('publish_base_configFields_requiredWarn'),
    };
  }
  if (verifyOutputStructFieldAsPrimaryKey(field)) {
    return { ok: true, error: '' };
  }
  return {
    ok: false,
    error: '',
  };
};

const validateInputConfig = (config: FeishuBaseConfigFe) => {
  if (!config.input_config.length) {
    return false;
  }
  if (!validateInputFieldsCommonPattern(config.input_config)) {
    return false;
  }
  return config.input_config.every(validateSingleInputFieldControl);
};

const validateInputFieldsCommonPattern = (inputConfigs: InputConfigFe[]) => {
  if (!inputConfigs.every(cfg => cfg.title && cfg.input_component)) {
    return false;
  }
  return !inputConfigs.some(cfg => cfg.invalid);
};

export const validateSingleInputFieldControl = (
  inputControlConfig: InputConfigFe,
): boolean => {
  const { type } = inputControlConfig.input_component;
  if (!type) {
    return false;
  }
  if (type === InputComponentType.Text) {
    const maxChar = inputControlConfig.input_component.max_char;
    return (
      maxChar !== undefined &&
      Number.isInteger(maxChar) &&
      maxChar > 0 &&
      maxChar <= INPUT_CONFIG_TEXT_MAX_CHAR
    );
  }
  if (getIsSelectType(type)) {
    return (
      inputControlConfig.input_component.choice?.length > 0 &&
      inputControlConfig.input_component.choice.every(x => !!x.name.trim())
    );
  }
  return !!inputControlConfig.input_component.supported_type?.length;
};
