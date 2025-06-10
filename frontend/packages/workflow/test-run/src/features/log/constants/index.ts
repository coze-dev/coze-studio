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
