import { type PropsWithChildren } from 'react';
import classNames from 'classnames';

import { FieldEmpty } from './field-empty';

import styles from './field.module.less';

interface FieldProps {
  label: string | React.ReactNode;
  isEmpty?: boolean;
  labelClassName?: string;
  contentClassName?: string;
  customEmptyLabel?: string;
}

export function Field({
  label,
  isEmpty = false,
  children,
  labelClassName,
  contentClassName,
  customEmptyLabel,
}: PropsWithChildren<FieldProps>) {
  return (
    <>
      <div className={classNames(styles.label, labelClassName)}>{label}</div>
      <div className={`${styles.content} ${contentClassName}`}>
        {isEmpty ? (
          <FieldEmpty fieldName={customEmptyLabel ?? label} />
        ) : (
          children
        )}
      </div>
    </>
  );
}
