import type {
  WorkflowEdgeJSON,
  WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';
import type { NodeData } from '@coze-workflow/nodes';
import type { ValueOf, WorkflowMode } from '@coze-workflow/base';

import type { WORKFLOW_CLIPBOARD_TYPE, WORKFLOW_EXPORT_TYPE } from './constant';

export interface WorkflowClipboardData {
  type: typeof WORKFLOW_CLIPBOARD_TYPE;
  json: WorkflowClipboardJSON;
  source: WorkflowClipboardSource;
  bounds: WorkflowClipboardRect;
}

export interface WorkflowExportData {
  type: typeof WORKFLOW_EXPORT_TYPE;
  json: WorkflowClipboardJSON;
  source: WorkflowClipboardSource;
}

export interface WorkflowClipboardJSON {
  nodes: WorkflowClipboardNodeJSON[];
  edges: WorkflowEdgeJSON[];
}

export interface WorkflowClipboardSource {
  workflowId: string;
  flowMode: WorkflowMode;
  spaceId: string;
  host: string;
  isDouyin: boolean;
}

export interface WorkflowClipboardRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowClipboardNodeTemporary {
  externalData?: ValueOf<NodeData>;
  bounds: WorkflowClipboardRect;
}

export interface WorkflowClipboardNodeJSON extends WorkflowNodeJSON {
  blocks?: WorkflowClipboardNodeJSON[];
  // eslint-disable-next-line @typescript-eslint/naming-convention -- _temp 是内部字段，不对外暴露
  _temp: WorkflowClipboardNodeTemporary;
}
