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

import classNames from 'classnames';
import { Space } from '@coze-arch/coze-design';

import { getBarBgColor, getBarHeights } from './utils';
import { type AudioWaveProps } from './type';

import styles from './index.module.less';

const waveBarNumberMap = {
  large: 41,
  medium: 29,
  small: 4,
};
export const AudioWave = ({
  size = 'medium',
  volumeNumber = 0,
  type = 'default',
  wrapperClassName,
  waveClassName,
}: AudioWaveProps) => {
  const volumeRealNumber = Math.max(Math.min(volumeNumber, 100), 0);
  const waveBarNumber = waveBarNumberMap[size] || 29;
  const waveBarHeights = getBarHeights(waveBarNumber, volumeRealNumber);

  return (
    <Space
      spacing={3}
      align="center"
      className={classNames(styles.container, wrapperClassName)}
    >
      {waveBarHeights.map((height, index) => (
        <div
          className={classNames(
            styles[`audio-wave-${index}`],
            styles[type],
            styles.bar,
            styles[size],
            waveClassName,
          )}
          style={{
            backgroundColor: getBarBgColor(index, waveBarNumber, type),
            height,
          }}
          key={`${type}_${index}`}
        />
      ))}
    </Space>
  );
};
