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

import { useCallback, useRef, useState, type FC } from 'react';

import { debounce } from 'lodash-es';
import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';

import styles from './index.module.less';

interface InnerContainerProps {
  name: string;
  onBlur?: () => void;
  onFocus?: () => void;
  isError?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * The editor container in the form encapsulates the border style in the foucs error state
 * @param name
 * @param onBlur
 * @param onFocus
 * @param isError
 * @param onMouseEnter
 * @param onMouseLeave
 * @param className editor outer style
 * @param children
 */
export const InnerEditorContainer: FC<InnerContainerProps> = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    name,
    onBlur,
    onFocus,
    isError,
    className,
    onMouseEnter,
    onMouseLeave,
    children,
  } = props;

  const [focus, _setFocus] = useState<boolean>(false);
  const { getNodeSetterId } = useNodeTestId();
  const dataTestID = getNodeSetterId(name);

  // Set anti-shake to prevent onFocus/onBlur from shaking when clicked
  const setFocus = useCallback(
    debounce((newFocusValue: boolean) => {
      _setFocus(newFocusValue);
    }, 50),
    [],
  );

  const handleOnBlur = () => {
    setFocus(false);
    onBlur?.();
  };

  return (
    <div
      key={dataTestID}
      data-testid={dataTestID}
      className={classNames(className, 'w-full', {
        [styles['editor-normal']]: !focus && !isError,
        [styles['editor-focused']]: focus && !isError,
        [styles['editor-error']]: isError,
      })}
      onFocus={() => {
        setFocus(true);
        onFocus?.();
      }}
      onMouseEnter={() => onMouseEnter?.()}
      onMouseLeave={() => onMouseLeave?.()}
      onBlur={handleOnBlur}
      ref={containerRef}
    >
      {children}
    </div>
  );
};
