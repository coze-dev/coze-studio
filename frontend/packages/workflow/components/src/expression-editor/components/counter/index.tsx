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
 * 长度计数器
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
