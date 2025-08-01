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

import cx from 'classnames';
import { I18n } from '@coze-arch/i18n';

import useConfig from '../../hooks/use-config';
import {
  OperatorLargeSize,
  OperatorSmallSize,
  SpacingSize,
  OperatorTypeBaseWidth,
} from '../../constants';

import styles from './index.module.less';

export default function Header() {
  const { readonly, withDescription, hasObjectLike } = useConfig();

  if (readonly) {
    return null;
  }

  return (
    <div
      className={cx(styles.header, {
        [styles.withDescription]: withDescription,
      })}
    >
      {/* name */}
      <div className={styles.name}>
        <span className={styles.text}>
          {I18n.t('workflow_detail_end_output_name')}
        </span>
      </div>

      {/* type */}
      <div
        className={styles.type}
        style={
          withDescription
            ? {
                width: OperatorTypeBaseWidth,
              }
            : !hasObjectLike
            ? { width: OperatorSmallSize + SpacingSize + OperatorTypeBaseWidth }
            : { width: OperatorLargeSize + SpacingSize + OperatorTypeBaseWidth }
        }
      >
        <span className={styles.text}>
          {I18n.t('workflow_detail_start_variable_type')}
        </span>
      </div>

      {/* Description currently only exists in LLM output */}
      {withDescription ? (
        <div className={styles.description}>
          <span className={styles.text}>
            {I18n.t('workflow_detail_llm_output_decription_title')}
          </span>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
