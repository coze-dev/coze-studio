import { type PropsWithChildren } from 'react';

import classNames from 'classnames';

import { IconRemove } from './icon-remove';

import styles from './field-array-item.module.less';

interface FieldArrayItemProps {
  /** @deprecated */
  disableDelete?: boolean;
  disableRemove?: boolean;
  /** @deprecated */
  hiddenDelete?: boolean;
  hiddenRemove?: boolean;
  className?: string;
  containerClassName?: string;
  removeIconClassName?: string;
  /** @deprecated */
  onDelete?: () => void;
  onRemove?: () => void;
  removeTestId?: string;
}

export function FieldArrayItem({
  className = '',
  containerClassName,
  removeIconClassName,
  disableDelete = false,
  hiddenDelete = false,
  onDelete,
  disableRemove = false,
  hiddenRemove = false,
  onRemove,
  children,
  removeTestId,
}: PropsWithChildren<FieldArrayItemProps>) {
  return (
    <div
      className={classNames(containerClassName, 'flex items-start gap-[8px]')}
    >
      <div
        className={classNames(
          `flex gap-[4px] items-start flex-1 ${styles.content} min-w-0 min-w-0`,
          className,
        )}
      >
        {children}
      </div>
      {!hiddenRemove && !hiddenDelete && (
        <IconRemove
          className={removeIconClassName}
          disabled={disableRemove || disableDelete}
          onClick={onRemove || onDelete}
          testId={removeTestId}
        />
      )}
    </div>
  );
}
