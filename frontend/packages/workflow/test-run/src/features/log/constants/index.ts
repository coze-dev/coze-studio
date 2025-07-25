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
 
export {
  totalConditionValueMap,
  ConditionRightType,
  logicTextMap,
} from './condition';

/** 日志类型 */
export enum LogType {
  /** 输入 */
  Input,
  /** 输出 */
  Output,
  /** 批处理数据 */
  Batch,
  /** Condition */
  Condition,
  /** 大模型推理过程 */
  Reasoning,
  /** 大模型Function过程 */
  FunctionCall,
  /** 子流程跳转连接 */
  WorkflowLink,
}

export enum EndTerminalPlan {
  Variable = 1,
  Text = 2,
}
