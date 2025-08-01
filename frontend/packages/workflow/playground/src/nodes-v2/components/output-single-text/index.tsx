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

import React, { type CSSProperties } from 'react';

import { Tag } from '@coze-arch/coze-design';

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
