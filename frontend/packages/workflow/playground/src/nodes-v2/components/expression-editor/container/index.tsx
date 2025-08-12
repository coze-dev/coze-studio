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

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from 'react';

import { debounce } from 'lodash-es';
import classNames from 'classnames';
import { SelectorBoxConfigEntity } from '@flowgram-adapter/free-layout-editor';
import { useEntity } from '@flowgram-adapter/free-layout-editor';
import {
  ExpressionEditorCounter,
  ExpressionEditorEvent,
  ExpressionEditorModel,
  type ExpressionEditorTreeNode,
  Expression,
} from '@coze-workflow/components';
import { type InputValueVO, useNodeTestId } from '@coze-workflow/base';

import { useParseText, useVariableTree } from '../hooks';

import styles from './index.module.less';

export interface ExpressionEditorContainerProps {
  name: string;
  value: string;
  key?: string;
  placeholder?: string | (() => string);
  readonly?: boolean;
  disableSuggestion?: boolean;
  disableCounter?: boolean;
  onChange?: (value: string) => void;
  minRows?: number;
  maxLength?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  isError?: boolean;
  inputParameters?: InputValueVO[];
  className?: string;
  containerClassName?: string;
  shouldUseContainerRef?: boolean;
  testId?: string;
  onChangeTrigger?: 'onChange' | 'onBlur';
}

/**
 * Aggregation layer for business logic and editor logic
 */
export const ExpressionEditorContainer: FC<
  ExpressionEditorContainerProps
> = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    name,
    key,
    onChange,
    onBlur,
    onFocus,
    isError,
    readonly = false,
    disableSuggestion = false,
    disableCounter = true,
    minRows = 4,
    className,
    containerClassName,
    shouldUseContainerRef,
    testId,
    onChangeTrigger = 'onBlur',
  } = props;
  const maxLength = undefined; // Temporary Disable
  const variableTree: ExpressionEditorTreeNode[] = useVariableTree();
  const [focus, _setFocus] = useState<boolean>(false);
  const { getNodeSetterId } = useNodeTestId();

  const selectorBoxConfig = useEntity<SelectorBoxConfigEntity>(
    SelectorBoxConfigEntity,
  );

  const [curEditorVal, setCurEditorVal] = useState<string>(props.value || '');

  const placeholder = useParseText(props.placeholder);
  const dataTestID = getNodeSetterId(testId ?? name);
  const formValue: string = props.value || '';
  const [model] = useState<ExpressionEditorModel>(
    () => new ExpressionEditorModel(formValue),
  );
  model.setVariableTree(variableTree);
  model.setFocus(focus);

  // Set anti-shake to prevent onFocus/onBlur from shaking when clicked
  const setFocus = useCallback(
    debounce((newFocusValue: boolean) => {
      _setFocus(newFocusValue);
    }, 50),
    [],
  );

  const overflow = useMemo(() => {
    if (typeof maxLength !== 'number') {
      return false;
    }
    return model.value.length > maxLength;
  }, [model.value.length, maxLength]);

  useEffect(() => {
    const disposer = model.on<ExpressionEditorEvent.Change>(
      ExpressionEditorEvent.Change,
      params => {
        onChange && onChange(params.value);
      },
    );
    return () => {
      disposer();
    };
  }, [onChange]);

  function handlePopoverVisibilityChange(visible: boolean) {
    if (visible) {
      selectorBoxConfig.disabled = true;
    } else {
      selectorBoxConfig.disabled = false;
    }
  }

  /**
   * There is a situation where value and editor.getValue () are always inconsistent when entering Chinese, resulting in re-rendering
   * So update the form data when changing to onBlur
   */
  const handleOnBlur = () => {
    if (onChangeTrigger === 'onBlur') {
      onChange?.(curEditorVal);
    }
    setFocus(false);
    onBlur?.();
  };

  return (
    <div
      key={key}
      className={classNames(
        containerClassName,
        styles['expression-editor-container'],
        {
          [styles['expression-editor-focused']]: focus,
          [styles['expression-editor-error']]: isError || overflow,
        },
      )}
      onFocus={() => {
        setFocus(true);
        onFocus?.();
      }}
      onBlur={handleOnBlur}
      ref={containerRef}
    >
      <Expression.EditorProvider>
        <Expression.Renderer
          value={formValue}
          variableTree={variableTree}
          className={classNames(
            className,
            styles['editor-render'],
            styles['editor-render-cm-content'],
            styles[`editor-render-cmMinRows-${minRows}`],
            {
              [styles['editor-render-bottom-padding']]:
                !disableCounter || overflow,
            },
          )}
          readonly={readonly}
          placeholder={placeholder}
          dataTestID={dataTestID}
          onChange={v => {
            onChangeTrigger === 'onBlur' ? setCurEditorVal(v) : onChange?.(v);
          }}
        />
        {readonly || disableSuggestion ? null : (
          <Expression.Popover
            variableTree={variableTree}
            getPopupContainer={() =>
              shouldUseContainerRef
                ? containerRef.current ?? document.body
                : document.body
            }
            onVisibilityChange={handlePopoverVisibilityChange}
          />
        )}
      </Expression.EditorProvider>

      <ExpressionEditorCounter
        model={model}
        maxLength={maxLength}
        disabled={disableCounter && !overflow}
        isError={overflow}
      />
    </div>
  );
};
