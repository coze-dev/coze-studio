/**
 * 这个组件在 workflow 画布内提供一个 sidesheet 的渲染占位，让画布内的 sidesheet 的占位可以挤压画布，实现一些侧拉联动的交互
 * 在这个占位内，还是默认使用 semi-ui 的 SideSheet 来渲染测拉窗，保持开发简单
 */

import { WORKFLOW_OUTER_SIDE_SHEET_HOLDER } from '../../constants';

import styles from './index.module.less';

export const WorkflowOuterSideSheetHolder = () => (
  <div
    id={WORKFLOW_OUTER_SIDE_SHEET_HOLDER}
    className={styles.workflowOuterSideSheetHolder}
  ></div>
);
