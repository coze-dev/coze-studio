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
 
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';
/**
 * 目前项目中从 flow-sdk 导入的类型位置比较混乱
 * test run 全部收口到 kit
 */
export { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

interface Context {
  isChatflow: boolean;
  isInProject: boolean;
  workflowId: string;
  spaceId: string;
}
/**
 * Node Registry Test Meta
 */
export type NodeTestMeta =
  | {
      /**
       * 是否支持测试集
       */
      testset?: boolean;
      /**
       * TestRun 运行所需的关联上下文
       */
      generateRelatedContext?: (
        node: WorkflowNodeEntity,
        context: Context,
      ) => IFormSchema | null | Promise<IFormSchema | null>;
      generateFormInputProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
      generateFormBatchProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
      generateFormSettingProperties?: (
        node: WorkflowNodeEntity,
      ) => IFormSchema['properties'] | Promise<IFormSchema['properties']>;
    }
  | boolean;
