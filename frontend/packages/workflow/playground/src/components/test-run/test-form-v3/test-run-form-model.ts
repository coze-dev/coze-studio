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
   * Is it an empty form?
   */
  empty?: boolean;
  /**
   * Whether the verification is passed
   */
  validate?: boolean;
  /**
   * form value
   */
  values?: any;
}

/**
 * Form capability transparency model
 */
export class TestRunFormModel {
  innerForm: FormModel | null = null;

  /**
   * Original schema
   */
  originSchema: IFormSchema | null = null;
  /**
   * View-converted schema
   */
  modeSchema: IFormSchema | null = null;

  /**
   * mount form instance
   */
  mounted(next: FormModel) {
    this.innerForm = next;
  }

  getUIMode() {
    return this.modeSchema?.['x-form-mode'] || 'form';
  }

  /**
   * Submit the form, including form validation
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
