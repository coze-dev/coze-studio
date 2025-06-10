import React, {
  type FC,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { debounce } from 'lodash-es';
import cs from 'classnames';
import { type ExpressionEditorTreeNode } from '@coze-workflow/sdk';
import { type TextAreaProps } from '@coze/coze-design';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';

import { getCssVarStyle } from './util';
import ExpressionEditorContainer, {
  type ExpressionEditorContainerRef,
} from './container';

import styles from './index.module.less';

export interface UsageWithVarTextAreaProps
  extends Pick<
    TextAreaProps,
    'maxCount' | 'rows' | 'value' | 'style' | 'placeholder'
  > {
  onChange?: (value: string) => void;
  variableProps?: {
    variableList: ExpressionEditorTreeNode[];
    getPopupContainer?: PopoverProps['getPopupContainer'];
    editorRef?: RefObject<ExpressionEditorContainerRef>;
    isErrorStatus?: boolean;
  };
}

const debounceMs = 100;

const VarQueryTextarea: FC<UsageWithVarTextAreaProps> = props => {
  const { maxCount, rows, style, value, onChange, placeholder, variableProps } =
    props;
  const {
    variableList = [],
    getPopupContainer,
    editorRef: propEditorRef,
    isErrorStatus = false,
  } = variableProps ?? {};
  const editorRef = useRef<ExpressionEditorContainerRef>(null);
  const [focus, _setFocus] = useState<boolean>(false);
  const showMaxCount = typeof maxCount === 'number';
  const scroll = typeof rows === 'number';
  const cssVarsStyle = getCssVarStyle({ rows, style });
  const count = value ? value.length : 0;

  useEffect(() => editorRef.current?.model.setFocus(focus), [focus]);

  // 设置防抖防止 onFocus / onBlur 在点击时出现抖动
  const setFocus = useCallback(
    debounce((newFocusValue: boolean) => {
      _setFocus(newFocusValue);
    }, debounceMs),
    [],
  );

  return (
    <div
      className={cs(
        styles.textarea,
        focus && styles.focus,
        isErrorStatus && styles.error,
      )}
      style={cssVarsStyle}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <div className={scroll ? styles.scroller : undefined}>
        <ExpressionEditorContainer
          ref={propEditorRef ?? editorRef}
          value={value ?? ''}
          onChange={onChange}
          variableTree={variableList}
          placeholder={placeholder}
          getPopupContainer={getPopupContainer}
        />
      </div>
      {showMaxCount ? (
        <div className={styles.footer}>
          {count}/{maxCount}
        </div>
      ) : null}
    </div>
  );
};

export default VarQueryTextarea;
