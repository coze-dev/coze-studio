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
 * This component provides a sidesheet rendering space in the workflow canvas, so that the sidesheet space in the canvas can squeeze the canvas to achieve some side-pull interaction
 * In this space, the semi-ui SideSheet is still used by default to render the pull window, keeping development simple
 */

import { WORKFLOW_OUTER_SIDE_SHEET_HOLDER } from '../../constants';

import styles from './index.module.less';

export const WorkflowOuterSideSheetHolder = () => (
  <div
    id={WORKFLOW_OUTER_SIDE_SHEET_HOLDER}
    className={styles.workflowOuterSideSheetHolder}
  ></div>
);
