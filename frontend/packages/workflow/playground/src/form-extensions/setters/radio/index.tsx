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

import { type FC } from 'react';

import { Radio as BaseRadio, type RadioProps } from '../../components/radio';

import styles from './index.module.less';

export const Radio: FC<RadioProps> = props => (
  <div className={styles['workflow-node-setter-radio']}>
    <BaseRadio {...props} />
  </div>
);

export const radio = {
  key: 'Radio',
  component: Radio,
};
