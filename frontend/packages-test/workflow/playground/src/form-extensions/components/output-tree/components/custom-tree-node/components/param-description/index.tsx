/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { useState } from 'react';

import cs from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type TextAreaProps } from '@coze-arch/bot-semi/Input';

import { type TreeNodeCustomData } from '../../type';
import { DescriptionLine } from '../../constants';
import { useOutputTreeContext } from '../../../../context';
import WorkflowSLTextArea from '../../../../../../../ui-components/workflow-sl-textarea';

import styles from './index.module.less';

export interface ParamNameProps {
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
  const [text, setText] = useState(data.description || '');

  const { testId } = useOutputTreeContext();
  const { concatTestId } = useNodeTestId();

  return (
    <div className={styles.container}>
      <WorkflowSLTextArea
        className={cs(
          inputFocus
            ? styles['desc-focus']
            : data.description
              ? styles['desc-not-focus-with-value']
              : styles['desc-not-focus'],
          styles.desc,
          hasObjectLike ? styles['desc-object-like'] : null,
        )}
        value={text}
        // 好像不生效
        disabled={disabled}
        handleBlur={() => {
          setInputFocus(false);
          onLineChange?.(DescriptionLine.Single);
          onChange(text);
        }}
        handleChange={(desc: string) => {
          setText(desc);
        }}
        handleFocus={() => {
          setInputFocus(true);
          onLineChange?.(DescriptionLine.Multi);
        }}
        inputFocusProps={
          {
            placeholder: I18n.t('workflow_detail_llm_output_decription'),
            maxLength: 1000,
            rows: 3,
            autosize: false,
            maxCount: 1000,
            style: {
              height: 80,
            },
            'data-testid': concatTestId(
              testId ?? '',
              data.field,
              'param-description-input',
            ),
          } as unknown as TextAreaProps
        }
        inputBlurProps={
          {
            placeholder: I18n.t('workflow_detail_llm_output_decription'),
            rows: 1,
            autosize: false,
            'data-testid': concatTestId(
              testId ?? '',
              data.field,
              'param-description-input',
            ),
          } as unknown as TextAreaProps
        }
      />
    </div>
  );
}
