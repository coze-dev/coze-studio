import React, { type CSSProperties } from 'react';

import { Tag } from '@coze/coze-design';

import styles from './index.module.less';

interface Props {
  label?: string;
  type?: string;
  required?: boolean;
  style?: CSSProperties;
}

export const OutputSingleText = ({ label, type, required, style }: Props) => (
  <p className={styles.content} style={style}>
    <span>{label}</span>
    {required ? <span style={{ color: '#f93920' }}>*</span> : null}
    {type ? <Tag className={styles.tag}>{type}</Tag> : null}
  </p>
);
