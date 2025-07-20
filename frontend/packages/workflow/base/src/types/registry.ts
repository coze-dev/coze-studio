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
 
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowNodeEntity,
  type WorkflowSubCanvas,
  type WorkflowNodeRegistry as WorkflowOriginNodeRegistry,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

import {
  type OutputValueVO,
  type InputValueVO,
  type ValueExpression,
} from './vo';
import { type VariableTagProps } from './view-variable-type';
import { type StandardNodeType } from './node-type';

export interface WorkflowNodeVariablesMeta {
  /**
   * 输出变量路径, 默认 ['outputs']
   */
  outputsPathList?: string[];
  /**
   * 输入变量路径，默认 ['inputs.inputParameters']
   */
  inputsPathList?: string[];
  batchInputListPath?: string;
}

export namespace WorkflowNodeVariablesMeta {
  export const DEFAULT: WorkflowNodeVariablesMeta = {
    outputsPathList: ['outputs'],
    inputsPathList: ['inputs.inputParameters'],
    batchInputListPath: 'inputs.batch.inputLists',
  };
}

export interface NodeMeta<NodeTest = any> {
  isStart?: boolean;
  isNodeEnd?: boolean;
  deleteDisable?: boolean;
  copyDisable?: boolean; // 无法复制
  nodeDTOType: StandardNodeType;
  nodeMetaPath?: string;
  batchPath?: string;
  outputsPath?: string;
  inputParametersPath?: string;
  renderKey?: string;
  style?: any;
  errorStyle?: any;
  size?: { width: number; height: number }; // 初始化时候的默认大小
  defaultPorts?: Array<any>;
  useDynamicPort?: boolean;
  disableSideSheet?: boolean;
  subCanvas?: (node: WorkflowNodeEntity) => WorkflowSubCanvas | undefined;

  /** 是否展示触发器 icon */
  showTrigger?: (props: { projectId?: string }) => boolean;
  /** 是否隐藏测试 */
  hideTest?: boolean;
  /** 获取卡片输入变量标签 */
  getInputVariableTag?: (
    /** 变量名称 */
    variableName: string | undefined,
    /** 输入值或变量 */
    input: ValueExpression,
    /** 附加参数 */
    extra?: {
      /**
       * 变量服务，从 '@coze-workflow/variable' 导入的 WorkflowVariableService
       * 这里不写上类型，是为了避免循环引用，另外 base 包引用 variable 包内容也不合理
       */
      variableService: any;

      /** 当前节点 */
      node: WorkflowNodeEntity;
    },
  ) => VariableTagProps;

  /** 是否支持单节点调试copilot生成表单参数 */
  enableCopilotGenerateTestNodeForm?: boolean;
  /**
   * 获取llm ids，所有需要用到大模型选择的的节点必须实现该方法
   * 因为用户可能存在账户升级或者模型下架，正常拉到的列表数据可能没有该id
   * 所以模型列表获取需要遍历所有节点拿到被用过的模型id
   * @param nodeJSON
   * @returns
   */
  getLLMModelIdsByNodeJSON?: (
    nodeJSON: WorkflowNodeJSON,
  ) => string[] | undefined | string | number | number[];
  /**
   * 节点 header 不可编辑 & 隐藏 ... 按钮
   */
  headerReadonly?: boolean;
  headerReadonlyAllowDeleteOperation?: boolean;

  /**
   * 节点帮助文档
   */
  helpLink?: string | ((props: { apiName: string }) => string);
  /**
   * 节点测试相关数据
   */
  test?: NodeTest;
}

export interface WorkflowNodeRegistry<NodeTestMeta = any>
  extends WorkflowOriginNodeRegistry {
  variablesMeta?: WorkflowNodeVariablesMeta;
  meta: NodeMeta<NodeTestMeta>;

  /**
   * 特化：根据节点获取输入 Parameters 的值，默认通过 /inputParameters 字段判断
   * @param node
   * @returns
   */
  getNodeInputParameters?: (node: FlowNodeEntity) => InputValueVO[] | undefined;

  /**
   * 获取舞台节点右侧更多菜单的额外操作，目前在子流程节点和插件节点中使用
   * @returns
   */
  getHeaderExtraOperation?: (
    formValues: any,
    node: FlowNodeEntity,
  ) => React.ReactNode;

  /**
   * 特化：根据节点获取输出 Outputs 的值，默认通过 /outputs 字段判断
   */
  getNodeOutputs?: (node: FlowNodeEntity) => OutputValueVO[] | undefined;

  /**
   * 节点提交前最后一次转化，这个方法在 `formMeta.transformOnSubmit` 之后执行
   * @param node 节点数据
   * @param 转化后的节点数据
   */
  beforeNodeSubmit?: (node: WorkflowNodeJSON) => WorkflowNodeJSON;

  /**
   * - 节点 Registry 初始化，可以在这里获取初始化数据，然后再进行表单渲染，注意此时 node 还没有创建
   * - 目前适用于 v2 表单引擎节点
   * @param nodeJSON 节点初始化数据（点击添加时，或者从后端获取时的节点数据）
   * @param context WorkflowPlaygroundContext，参见 packages/workflow/playground/src/workflow-playground-context.ts
   * @returns Promise<void>
   */
  onInit?: (nodeJSON: WorkflowNodeJSON, context: any) => Promise<void>;

  /**
   * - 是否有错误信息（从 service 中拿），如果有错误信息返回错误信息，否则返回空串或者 undefined
   * - 目前在 node-context-provider.tsx 中消费，监听当前节点错误信息，如果有，更新 FlowNodeErrorData 数据，从而触发节点渲染错误状态
   * - 目前适用于 v2 表单引擎节点
   * @param nodeJSON 节点初始化数据（点击添加时，或者从后端获取时的节点数据）
   * @param context WorkflowPlaygroundContext，参见 packages/workflow/playground/src/workflow-playground-context.ts
   */
  checkError?: (nodeJSON: WorkflowNodeJSON, context: any) => string | undefined;

  /**
   * - 节点销毁时调用，用于做一些清理工作，例如将相关节点的错误信息清空，回收资源
   * - 目前适用于 v2 表单引擎节点
   * @param node 节点
   * @param context workflow-playground-context
   * @returns
   */
  onDispose?: (nodeJSON: WorkflowNodeJSON, context: any) => void;
}
