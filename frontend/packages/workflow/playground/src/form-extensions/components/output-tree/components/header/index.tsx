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
    hasObjectLike?: boolean;
    hasCollapse?: boolean;
    hasDescription?: boolean;
    hasRequired?: boolean;
  };
  columnsRatio?: string;
}

export default function Header({
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
          {I18n.t('workflow_detail_end_output_name')}
        </span>
      </div>

      {/* type */}
      <div className={styles.type} style={columnsStyle.type}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_start_variable_type')}
        </span>
      </div>

      <div className="relative flex gap-1">
        {/* required label */}
        {config.hasRequired ? (
          <div className={styles.required}>
            <span className={styles.text}>{I18n.t('wf_20241206_001')}</span>
          </div>
        ) : null}

        {/* description */}
        {config.hasDescription ? (
          <div
            className={styles.description}
            style={{
              width: 24,
            }}
          >
            <div className={styles.descriptionTitle}>
              <span className={styles.text}>
                {/* {I18n.t('workflow_detail_llm_output_decription_title')} */}
              </span>
            </div>
          </div>
        ) : null}

        {/* Object operation placeholder */}
        {config.hasObjectLike ? <div className="w-6"></div> : null}

        {/* Required placeholder */}
        {config.hasRequired ? <div className="w-6"></div> : null}

        {/* Delete button placeholder */}
        <div className="w-6"></div>
      </div>
    </div>
  );
}
