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

/* eslint-disable @typescript-eslint/no-magic-numbers */
import React from 'react';

import { I18n } from '@coze-arch/i18n';

import { useColumnsStyle } from '../../hooks/use-columns-style';
import { TreeCollapseWidth } from '../../constants';

import styles from './index.module.less';

interface HeaderProps {
  readonly?: boolean;
  config: {
    hasObject?: boolean;
    hasCollapse?: boolean;
  };
  columnsRatio?: string;
}

export default function InputHeader({
  readonly,
  config,
  columnsRatio,
}: HeaderProps) {
  const columnsStyle = useColumnsStyle(columnsRatio);

  if (readonly) {
    return null;
  }
  return (
    <div
      className={styles.header}
      style={{
        marginLeft: config.hasCollapse ? TreeCollapseWidth + 8 : 0,
      }}
    >
      {/* name */}
      <div className={styles.name} style={columnsStyle.name}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_node_parameter_name')}
        </span>
      </div>

      {/* value */}
      <div className={styles.value} style={columnsStyle.value}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_node_parameter_value')}
        </span>
      </div>

      {readonly ? null : (
        <div className="relative flex gap-1">
          {/* Object operation placeholder */}
          {config.hasObject ? <div className="w-6"></div> : null}

          {/* Delete button placeholder */}
          <div className="w-6"></div>
        </div>
      )}
    </div>
  );
}
