import {
  type Log,
  type ConditionLog,
  type OutputLog,
  type BaseLog,
  type FunctionCallLog,
  type WorkflowLinkLog,
} from '../types';
import { LogType } from '../constants';

/** 是否是输出日志 */
export const isOutputLog = (log: Log): log is OutputLog =>
  log.type === LogType.Output;

/** 是否是 condition 输入 */
export const isConditionLog = (log: Log): log is ConditionLog =>
  log.type === LogType.Condition;

/** 是否是大模型推理日志 */
export const isReasoningLog = (log: Log): log is BaseLog =>
  log.type === LogType.Reasoning;

export const isFunctionCallLog = (log: Log): log is FunctionCallLog =>
  log.type === LogType.FunctionCall;

/** 是否是子流程跳转连接 */
export const isWorkflowLinkLog = (log: Log): log is WorkflowLinkLog =>
  log.type === LogType.WorkflowLink;
