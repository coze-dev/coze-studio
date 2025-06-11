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
        // 好像不生效
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
