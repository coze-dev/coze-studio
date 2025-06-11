import React from 'react';

import classNames from 'classnames';
import { Tag } from '@coze/coze-design';

import styles from './index.module.less';

export interface OutputInfoType {
  label: string;
  type: string;
  required?: boolean;
  style?: React.CSSProperties;
}

export const OutputsParamDisplay = ({
  options,
}: {
  options: {
    outputInfo: OutputInfoType[];
    customClassNames?: string;
  };
}) => {
  const { outputInfo, customClassNames } = options ?? {};

  return (
    <div className={classNames('flex flex-col gap-[8px]', customClassNames)}>
      {outputInfo?.map?.(({ label, type, required, style }) => (
        <div className="flex items-center" style={style}>
          <div className={styles.label}>{label}</div>
          {required ? <span className={styles.required}>*</span> : null}
          {type ? (
            <Tag
              className={classNames(styles.tag, '!px-[3px] !py-[1px]')}
              color="primary"
            >
              {type}
            </Tag>
          ) : null}
        </div>
      ))}
    </div>
  );
};
