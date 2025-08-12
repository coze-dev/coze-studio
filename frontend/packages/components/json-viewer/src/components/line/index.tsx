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

import React from 'react';

import cls from 'classnames';

import { LineStatus } from '../../types';

import styles from './index.module.less';

export const Line: React.FC<{ status: LineStatus }> = ({ status }) => (
  <div
    className={cls(styles['json-viewer-line'], {
      [styles.hidden]: status === LineStatus.Hidden,
      [styles.visible]: status === LineStatus.Visible,
      [styles.half]: status === LineStatus.Half,
      [styles.last]: status === LineStatus.Last,
    })}
  ></div>
);
