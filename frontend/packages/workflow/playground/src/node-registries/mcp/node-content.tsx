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

import React from 'react';

import { InputParameters, Outputs } from '../common/components';

import styles from './node-content.module.less';

export function McpContent() {
  return (
    <div className={styles.mcpContainer}>
      {/* 工具信息显示 */}
      <div className={styles.mcpHeader}>
        <span className={styles.mcpIcon}>🔧</span>
        <span>MCP工具</span>
      </div>

      {/* 输入参数 */}
      <div className={styles.mcpParametersSection}>
        <InputParameters />
      </div>

      {/* 输出变量 */}
      <div className={styles.mcpOutputsSection}>
        <Outputs />
      </div>
    </div>
  );
}
