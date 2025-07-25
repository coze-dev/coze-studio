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
