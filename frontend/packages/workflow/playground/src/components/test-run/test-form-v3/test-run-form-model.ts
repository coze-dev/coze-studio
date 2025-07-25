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
import { cloneDeep } from 'lodash-es';
import { type FormModel, type IFormSchema } from '@coze-workflow/test-run-next';

import { formatValues } from './mode-form-kit';
interface SubmitResult {
  /**
   * 是否是空表单
   */
  empty?: boolean;
  /**
   * 是否校验通过
   */
  validate?: boolean;
  /**
   * 表单值
   */
  values?: any;
}

/**
 * 表单能力透出模型
 */
export class TestRunFormModel {
  innerForm: FormModel | null = null;

  /**
   * 原始的 schema
   */
  originSchema: IFormSchema | null = null;
  /**
   * 经过视图换算的 schema
   */
  modeSchema: IFormSchema | null = null;

  /**
   * 挂载表单实例
   */
  mounted(next: FormModel) {
    this.innerForm = next;
  }

  getUIMode() {
    return this.modeSchema?.['x-form-mode'] || 'form';
  }

  /**
   * 提交表单，包含表单校验
   */
  async submit(): Promise<SubmitResult> {
    if (!this.modeSchema || !this.innerForm) {
      return { empty: true, validate: true };
    }
    const validateResult = await this.innerForm.validate();

    if (validateResult.length) {
      return {
        validate: false,
      };
    }
    const values = formatValues({
      mode: this.modeSchema['x-form-mode'] || 'form',
      originFormSchema: this.originSchema || {},
      formValues: cloneDeep(this.innerForm.values),
    });
    return {
      validate: true,
      values,
    };
  }
}
