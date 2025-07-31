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

/**
 * Business layer process node class (encapsulation of node business rules)
 */
import {
  FlowNodeErrorData,
  FlowNodeFormData,
  isFormV2,
  type FormModelV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { getFormValueByPathEnds } from '../utils';
import {
  type StandardNodeType,
  type WorkflowNodeRegistry,
  type InputValueVO,
  type OutputValueVO,
} from '../types';
export class WorkflowNode {
  private node: FlowNodeEntity;

  constructor(node: FlowNodeEntity) {
    this.node = node;
    this.setData = this.setData.bind(this);
    this.setError = this.setError.bind(this);
  }

  public get registry(): WorkflowNodeRegistry {
    return this.node.getNodeRegistry() as WorkflowNodeRegistry;
  }

  public get inputParameters(): InputValueVO[] | undefined {
    if (this.registry.getNodeInputParameters) {
      return this.registry.getNodeInputParameters(this.node);
    }

    if (this.node.getNodeMeta()?.inputParametersPath) {
      return this.node
        .getData<FlowNodeFormData>(FlowNodeFormData)
        .formModel.getFormItemValueByPath(
          this.node.getNodeMeta()?.inputParametersPath,
        );
    }

    return this.getFormValueByPathEnds<InputValueVO[]>('/inputParameters');
  }

  public get outputs(): OutputValueVO[] | undefined {
    if (this.registry.getNodeOutputs) {
      return this.registry.getNodeOutputs(this.node);
    } else {
      return this.data?.outputs;
    }
  }

  // This method is recommended not to be used for the time being, because it does not reflect business logic, but is a simplification of the underlying method
  protected getFormValueByPathEnds<T = unknown>(
    pathEnds: string,
  ): T | undefined {
    return getFormValueByPathEnds(this.node, pathEnds);
  }

  get type() {
    return this.node.flowNodeType as StandardNodeType;
  }

  get isError() {
    return !!this.error;
  }

  get error() {
    const errorData = this.node.getData<FlowNodeErrorData>(FlowNodeErrorData);
    const error = errorData.getError();

    return error;
  }

  public setError(error: Error) {
    const errorData = this.node.getData<FlowNodeErrorData>(FlowNodeErrorData);
    errorData.setError(error);
  }

  get isInitialized() {
    return this.form.initialized;
  }

  get data() {
    return this.form.getFormItemValueByPath('/');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setData(data: any) {
    if (data === undefined) {
      return;
    }

    const { form } = this;

    if (isFormV2(this.node)) {
      Object.keys(data).forEach(key => {
        (form as FormModelV2).setValueIn(key, data[key]);
      });
    } else {
      const formItem = form.getFormItemByPath('/');
      if (formItem) {
        formItem.value = data;
      }
    }
  }

  get icon() {
    return this?.data?.nodeMeta?.icon;
  }

  get title() {
    return this?.data?.nodeMeta?.title;
  }

  get description() {
    return this?.data?.nodeMeta?.description;
  }

  private get form() {
    return this.node.getData(FlowNodeFormData).formModel;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getValueByPath<T = any>(pathname: string): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (this.form as any).getValueIn(pathname);
    return value;
  }
}
