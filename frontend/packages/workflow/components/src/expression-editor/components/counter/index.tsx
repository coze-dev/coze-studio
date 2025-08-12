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

import { useMemo, type FC } from 'react';

import classNames from 'classnames';

import { type ExpressionEditorModel } from '../../model';

import styles from './index.module.less';

interface ExpressionEditorCounterProps {
  className?: string;
  model: ExpressionEditorModel;
  maxLength?: number;
  disabled?: boolean;
  isError?: boolean;
}

/**
 * length counter
 */
export const ExpressionEditorCounter: FC<
  ExpressionEditorCounterProps
> = props => {
  const { className, model, maxLength, disabled, isError } = props;

  const { visible, count, max } = useMemo(() => {
    if (typeof model.value.length !== 'number') {
      return {
        visible: false,
      };
    }
    if (typeof maxLength !== 'number') {
      return {
        visible: false,
      };
    }
    return {
      visible: true,
      count: model.value.length,
      max: maxLength,
    };
  }, [model.value.length, maxLength]);

  if (disabled || !visible) {
    return <></>;
  }

  return (
    <div
      className={classNames(styles['expression-editor-counter'], className, {
        [styles['expression-editor-counter-error']]: isError,
      })}
    >
      <p>
        {count} / {max}
      </p>
    </div>
  );
};
