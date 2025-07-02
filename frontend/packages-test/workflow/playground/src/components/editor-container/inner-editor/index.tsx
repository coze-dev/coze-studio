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
 * 表单内编辑器容器，对 foucs error 状态下边框样式进行封装
 * @param name
 * @param onBlur
 * @param onFocus
 * @param isError
 * @param onMouseEnter
 * @param onMouseLeave
 * @param className 编辑器外层样式
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

  // 设置防抖防止 onFocus / onBlur 在点击时出现抖动
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
