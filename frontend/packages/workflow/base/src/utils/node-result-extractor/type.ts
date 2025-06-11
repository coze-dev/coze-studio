/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StandardNodeType, type WorkflowJSON } from '../../types';
import { type NodeResult } from '../../api';

export interface CaseResultData {
  dataList?: Array<{ title: string; data: any }>;
  imgList?: string[];
}

export interface NodeResultExtracted {
  nodeId?: string;
  nodeType?: StandardNodeType;
  isBatch?: boolean;
  caseResult?: CaseResultData[];
}
export type NodeResultExtractorParser = (
  nodeResult: NodeResult,
  workflowSchema: WorkflowJSON,
) => NodeResultExtracted;
