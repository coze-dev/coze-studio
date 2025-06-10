import {
  type VersionMetaInfo,
  type OperateType,
} from '@coze-workflow/base/api';

/** 流程提交历史列表组件 */
export interface WorkflowCommitListProps {
  className?: string;
  spaceId: string;
  workflowId: string;
  /** 操作类型 */
  type: OperateType;
  /** 只读模式, 只读历史卡片不可点, 不影响 action */
  readonly?: boolean;
  /** 每页拉取数量, 默认 10 */
  limit?: number;
  /** 当前选中项 */
  value?: string;
  /** 是否展示当前节点 */
  showCurrent?: boolean;
  /** 是否支持发布到 PPE 功能 */
  enablePublishPPE?: boolean;
  /** 隐藏 commitId (commitId可读性较差，非专业用户不需要感知) */
  hideCommitId?: boolean;
  /** 卡片点击 */
  onItemClick?: (item: VersionMetaInfo) => void;
  /** 恢复到某版本点击 */
  onResetToCommit?: (item: VersionMetaInfo) => void;
  /** 查看某版本点击 */
  onShowCommit?: (item: VersionMetaInfo) => void;
  /** 发布到多环境点击 */
  onPublishPPE?: (item: VersionMetaInfo) => void;
  /** 点击[现在] */
  onCurrentClick?: (currentKey: string) => void;
}
