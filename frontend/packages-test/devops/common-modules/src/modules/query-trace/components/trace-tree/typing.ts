import { type TreeProps } from '../tree';
import { type DataSource } from '../../typings/graph';
import { type SpanTypeConfigMap } from '../../typings/config';

export type TraceTreeProps = {
  dataSource: DataSource;
  spaceId?: string;
  selectedSpanId?: string;
  spanTypeConfigMap?: SpanTypeConfigMap;
} & Pick<
  TreeProps,
  | 'indentDisabled'
  | 'lineStyle'
  | 'globalStyle'
  | 'onSelect'
  | 'onClick'
  | 'onMouseMove'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'className'
>;

export interface SpanDetail {
  isCozeWorkflowNode: boolean;
  workflowLevel: number; // workflow 层级
  workflowVersion?: string; // 父节点透传给子节点
}

export interface WorkflowJumpParams {
  workflowID: string;
  executeID?: string;
  workflowNodeID?: string;
  workflowVersion?: string;
  subExecuteID?: string;
}
