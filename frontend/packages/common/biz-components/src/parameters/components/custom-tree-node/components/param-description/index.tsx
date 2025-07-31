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

import React, { useState } from 'react';

import cs from 'classnames';
import { I18n } from '@coze-arch/i18n';

import WorkflowSLTextArea from '../workflow-sl-textarea';
import { type TreeNodeCustomData } from '../../type';
import { DescriptionLine } from '../../constants';

import styles from './index.module.less';

interface ParamNameProps {
  data: TreeNodeCustomData;
  disabled?: boolean;
  onChange: (desc: string) => void;
  onLineChange?: (type: DescriptionLine) => void;
  hasObjectLike?: boolean;
}

export default function ParamDescription({
  data,
  disabled,
  onChange,
  onLineChange,
  hasObjectLike,
}: ParamNameProps) {
  const [inputFocus, setInputFocus] = useState(false);

  return (
    <div className={styles.container}>
      <WorkflowSLTextArea
        className={cs(
          inputFocus
            ? null
            : data.description
            ? styles['desc-not-focus-with-value']
            : styles['desc-not-focus'],
          styles.desc,
          hasObjectLike ? styles['desc-object-like'] : null,
        )}
        value={data.description}
        ellipsis={true}
        // It doesn't seem to work.
        disabled={disabled}
        handleBlur={() => {
          setInputFocus(false);
          onLineChange?.(DescriptionLine.Single);
        }}
        handleChange={(desc: string) => {
          onChange(desc);
        }}
        handleFocus={() => {
          setInputFocus(true);
          onLineChange?.(DescriptionLine.Multi);
        }}
        textAreaProps={
          inputFocus
            ? {
                placeholder: I18n.t('workflow_detail_llm_output_decription'),
                maxLength: 50,
                rows: 2,
                autosize: false,
                maxCount: 50,
              }
            : {
                placeholder: I18n.t('workflow_detail_llm_output_decription'),
                rows: 1,
                autosize: false,
              }
        }
      />
    </div>
  );
}
