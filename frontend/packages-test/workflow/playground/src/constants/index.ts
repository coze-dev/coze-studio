export const WORKFLOW_INNER_SIDE_SHEET_HOLDER =
  'workflow-inner-side-sheet-holder';

export const WORKFLOW_OUTER_SIDE_SHEET_HOLDER =
  'workflow-outer-side-sheet-holder';

export const DND_ACCEPT_KEY = 'flow-workflow-canvas-dnd';

export const WORKFLOW_PLAYGROUND_CONTENT_ID = 'workflow-playground-content';

export const WORKFLOW_CONTENT_ID = 'workflow-content';

export const SYSTEM_PROMPT_PANEL = 'system-prompt-panel';

export enum LayoutPanelKey {
  /** 节点表单 */
  NodeForm = 'node-form',
  /** 试运行流程表单 */
  TestFlowForm = 'test-flow-form',
  /** 试运行 chatflow */
  TestChatFlowForm = 'test-chat-flow-form',
  /** 日志列表 */
  TraceList = 'trace-list',
  /** 日志详情 */
  TraceDetail = 'trace-detail',
  /** 角色配置 */
  RoleConfig = 'role-config',
}

/**
 * 依赖来源类型
 */
export enum DependencySourceType {
  /** 数据库 */
  DataBase = 'database',
  /** 知识库 */
  DataSet = 'dataset',
  /** 大模型 */
  LLM = 'llm',
  /** 插件 */
  Plugin = 'plugin',
  /** 工作流 */
  Workflow = 'workflow',
}
