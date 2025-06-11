/** log 中的 value 可能值 */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

interface MockInfo {
  isHit: boolean;
  mockSetName?: string;
}

/** 通常的日志结构 */
export interface BaseLog {
  label: string;
  source: LogValueType;
  data: LogValueType;
  copyTooltip?: string;
  mockInfo?: MockInfo;
  type: 'input' | 'output' | 'raw_output' | 'batch';
}
/** condition 的日志结构 */
export interface ConditionLog {
  conditions: Array<{
    conditions: {
      leftData: LogValueType;
      rightData: LogValueType;
      operatorData: string;
    }[];
    name: string;
    logic: number;
    logicData: string;
  }>;
}

/** 嵌套的日志结构 */
export interface TreeLog {
  label: string;
  children: (BaseLog | ConditionLog)[];
}

export type Log = BaseLog | ConditionLog | TreeLog;

/** 格式化之后的 condition log */
export interface ConditionFormatLog {
  leftData: LogValueType;
  rightData: LogValueType;
  operatorData: string;
}

export interface WorkflowLinkLogData {
  workflowId: string;
  executeId: string;
  subExecuteId: string;
}
