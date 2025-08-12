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

import { ConfigEntity } from '@flowgram-adapter/free-layout-editor';

import type {
  TestFormSchema,
  FormDataType,
  TestFormDefaultValue,
} from '../components/test-run/types';
import { TestRunDataSource } from '../components/test-run/constants';
import { WorkflowGlobalStateEntity } from './workflow-global-state-entity';

interface WorkflowTestFormState {
  /** Test run form is visible */
  formVisible: boolean;
  /** Only one test run can be run at a time for freezing */
  frozen: string | null;
  autoGenerating: boolean;

  /** Coze graph 2.0 Node panel */
  commonSheetKey: null | string;
  testNodeFormVisible: boolean;
}

export class WorkflowTestFormStateEntity extends ConfigEntity<WorkflowTestFormState> {
  static type = 'WorkflowTestFormStateEntity';

  /** Schema without reactive */
  formSchema?: TestFormSchema;

  testRunDataSource = TestRunDataSource.User;

  /**
   * Cache user-filled data
   */
  formDataCacheMap = new Map<string, FormDataType>();

  /**
   * Form default, lower priority than formDataCache
   */
  formDefaultValue: Array<TestFormDefaultValue> = [];

  getDefaultConfig(): WorkflowTestFormState {
    return {
      formVisible: false,
      frozen: null,
      autoGenerating: false,
      commonSheetKey: null,
      testNodeFormVisible: false,
    };
  }
  openTestForm(schema: TestFormSchema) {
    this.formSchema = schema;
    this.updateConfig({
      formVisible: true,
    });
  }
  closeTestForm() {
    this.updateConfig({
      formVisible: false,
    });
    this.testRunDataSource = TestRunDataSource.User;
  }

  /**
   * Set testForm to cache data
   */
  setFormData(id: string, data: FormDataType) {
    this.formDataCacheMap.set(id, data);
  }

  /**
   * Set the cached data for the currently open testForm
   */
  setThisFormData(data: FormDataType) {
    /** This method does not need to specify an id. To ensure that formSchema is valid, it is only allowed when the testForm is open */
    if (!this.config.formVisible) {
      return;
    }
    const id = this.formSchema?.id;
    if (id) {
      this.setFormData(id, data);
    }
  }

  /**
   * Does testForm have cached data?
   */
  hasFormData(id: string) {
    return this.formDataCacheMap.has(id);
  }

  /**
   * Get testForm cache data
   */
  getFormData(id: string) {
    return this.formDataCacheMap.get(id);
  }

  /**
   * Clear all cached data, must be done when the canvas is destroyed
   */
  clearFormData() {
    this.formDataCacheMap.clear();
  }

  setTestFormDefaultValue(defaultValues: Array<TestFormDefaultValue>) {
    this.formDefaultValue = defaultValues;
  }

  getTestFormDefaultValue(id?: string): TestFormDefaultValue | undefined {
    const globalState = this.entityManager.getEntity<WorkflowGlobalStateEntity>(
      WorkflowGlobalStateEntity,
    );

    return (
      this.formDefaultValue.find(item => item.node_id === id) ??
      // PlaygroundProps can pass in test run form defaults
      globalState?.config.playgroundProps.testFormDefaultValues?.find(
        item => item.node_id === id,
      )
    );
  }

  clearTestFormDefaultValue() {
    this.formDefaultValue = [];
  }

  /** Freeze test run */
  freezeTestRun(id: string) {
    this.updateConfig({
      frozen: id,
    });
  }
  /** Thaw test run */
  unfreezeTestRun() {
    this.updateConfig({
      frozen: null,
    });
  }

  get autoGenerating() {
    return this.config.autoGenerating;
  }
  set autoGenerating(val: boolean) {
    this.updateConfig({
      autoGenerating: val,
    });
  }

  get commonSheetKey() {
    return this.config.commonSheetKey;
  }

  openCommonSheet(key: string) {
    this.updateConfig({
      commonSheetKey: key,
    });
  }
  closeCommonSheet() {
    this.updateConfig({
      commonSheetKey: null,
    });
  }
  showTestNodeForm() {
    this.updateConfig({
      testNodeFormVisible: true,
    });
  }
  closeTestNodeForm() {
    this.updateConfig({
      testNodeFormVisible: false,
    });
  }
}
