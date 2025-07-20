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
  /** test run form 是否可见 */
  formVisible: boolean;
  /** 同时只能运行一个 test run，用于冻结 */
  frozen: string | null;
  autoGenerating: boolean;

  /** coze graph 2.0 节点面板 */
  commonSheetKey: null | string;
  testNodeFormVisible: boolean;
}

export class WorkflowTestFormStateEntity extends ConfigEntity<WorkflowTestFormState> {
  static type = 'WorkflowTestFormStateEntity';

  /** schema 无需响应式 */
  formSchema?: TestFormSchema;

  testRunDataSource = TestRunDataSource.User;

  /**
   * 缓存用户填写过的数据
   */
  formDataCacheMap = new Map<string, FormDataType>();

  /**
   * 表单默认值，优先级低于 formDataCache
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
   * 设置 testForm 缓存数据
   */
  setFormData(id: string, data: FormDataType) {
    this.formDataCacheMap.set(id, data);
  }

  /**
   * 设置当前打开的 testForm 的缓存数据
   */
  setThisFormData(data: FormDataType) {
    /** 本方法无需指定 id，为保证 formSchema 有效，仅当 testForm 打开时允许使用 */
    if (!this.config.formVisible) {
      return;
    }
    const id = this.formSchema?.id;
    if (id) {
      this.setFormData(id, data);
    }
  }

  /**
   * testForm 是否有缓存数据
   */
  hasFormData(id: string) {
    return this.formDataCacheMap.has(id);
  }

  /**
   * 获取 testForm 缓存数据
   */
  getFormData(id: string) {
    return this.formDataCacheMap.get(id);
  }

  /**
   * 清除所有缓存数据，画布销毁时必须要做
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
      // playgroundProps 可传入test run表单默认值
      globalState?.config.playgroundProps.testFormDefaultValues?.find(
        item => item.node_id === id,
      )
    );
  }

  clearTestFormDefaultValue() {
    this.formDefaultValue = [];
  }

  /** 冻结 test run */
  freezeTestRun(id: string) {
    this.updateConfig({
      frozen: id,
    });
  }
  /** 解冻 test run */
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
