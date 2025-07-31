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

import { type AudioWaveProps } from './type';

export const getBarHeights = (
  waveBarNumber: number,
  volumeRealNumber: number,
) => {
  if (volumeRealNumber <= 0) {
    return new Array(waveBarNumber).fill(8);
  }
  const waveBarHeights = new Array(waveBarNumber)
    .fill(0)
    .map((_item, index) =>
      getBarHeight3(index, waveBarNumber, volumeRealNumber),
    );
  const minHeight = Math.min(...waveBarHeights);
  const maxHeight = Math.max(...waveBarHeights);
  const heightSpan = maxHeight - minHeight;
  return waveBarHeights.map(
    item =>
      8 +
      ((item - minHeight) / (maxHeight - minHeight)) * Math.min(12, heightSpan),
  );
};

export const getBarHeight3 = (
  index: number,
  maxNumber: number,
  volumeNumber: number,
) => {
  const percent = index / maxNumber;
  const maxHeight = 24;
  let baseHeight = 2;
  let randomMin = -2;
  let randomMax = 2;
  if (percent < 1 / 6) {
    baseHeight = 1 + (4 - 1) * percent * 6;
    randomMin = 0.1 + (-0.8 - 0.1) * percent * 6;
    randomMax = 0.3 + (0.6 - 0.3) * percent * 6;
  } else if (percent < 2 / 6) {
    baseHeight = 4 + (2 - 4) * (percent - 1 / 6) * 6;
    randomMin = -0.8 + (-0.0 + 0.8) * (percent - 1 / 6) * 6;
    randomMax = 0.6 + (0.6 - 0.6) * (percent - 1 / 6) * 6;
  } else if (percent < 3 / 6) {
    baseHeight = 2 + (8 - 2) * (percent - 2 / 6) * 6;
    randomMin = 0.0 + (Number(-1.6) - 0.0) * (percent - 2 / 6) * 6;
    randomMax = 0.6 + (1.2 - 0.6) * (percent - 2 / 6) * 6;
  } else if (percent < 4 / 6) {
    baseHeight = 8 + (2 - 8) * (percent - 3 / 6) * 6;
    randomMin = -1.6 + (0.0 + 1.6) * (percent - 3 / 6) * 6;
    randomMax = 1.2 + (0.6 - 1.2) * (percent - 3 / 6) * 6;
  } else if (percent < 5 / 6) {
    baseHeight = 2 + (4 - 2) * (percent - 4 / 6) * 6;
    randomMin = 0.0 + (Number(-0.8) - 0.0) * (percent - 4 / 6) * 6;
    randomMax = 0.6 + (0.6 - 0.6) * (percent - 4 / 6) * 6;
  } else if (percent < 1) {
    baseHeight = 4 + (1 - 4) * (percent - 5 / 6) * 6;
    randomMin = -0.8 + (0.1 + 0.8) * (percent - 5 / 6) * 6;
    randomMax = 0.1 + (0.3 - 0.6) * (percent - 5 / 6) * 6;
  }
  const height =
    baseHeight +
    volumeNumber *
      (Math.random() * (randomMax - randomMin) + randomMin) *
      (maxHeight - baseHeight);
  return height;
};

export const getBarBgColor = (
  index: number,
  maxNumber: number,
  type: AudioWaveProps['type'],
) => {
  let bgColor = '#FFF';
  switch (type) {
    case 'primary':
      {
        /*
         * implement : fill: linear-gradient(90deg, rgba(83, 71, 255, 0.20) 0%, #5347FF 20%, #B125F1 80%, rgba(177, 37, 241, 0.20) 100%);
         */
        let opacity = 0;
        let rColor = 0;
        let gColor = 0;
        let bColor = 0;
        const percent = index / maxNumber;
        if (percent < 0.2) {
          opacity = 0.2 + ((1 - 0.2) * percent) / 0.2;
          rColor = 83;
          gColor = 71;
          bColor = 255;
        } else if (percent < 0.8) {
          opacity = 1;
          rColor = Math.round(83 + ((177 - 83) * (percent - 0.2)) / 0.6);
          gColor = Math.round(71 + ((37 - 71) * (percent - 0.2)) / 0.6);
          bColor = Math.round(255 + ((241 - 255) * (percent - 0.2)) / 0.6);
        } else {
          opacity = 1 - ((1 - 0.2) * (percent - 0.8)) / 0.2;
          rColor = 177;
          gColor = 37;
          bColor = 241;
        }
        bgColor = `rgba(${rColor}, ${gColor}, ${bColor}, ${opacity.toFixed(
          2,
        )})`;
      }
      break;
    case 'warning':
      {
        bgColor = '#FF0030';
      }
      break;
    default:
      {
        /*
         * implement : fill: linear-gradient(90deg, rgba(255, 255, 255, 0.20) 0%, #FFF 20%, rgba(255, 255, 255, 0.90) 80%, rgba(255, 255, 255, 0.20) 100%);
         */
        let opacity = 0;
        const percent = index / maxNumber;
        if (percent < 0.2) {
          opacity = 0.2 + ((1 - 0.2) * percent) / 0.2;
        } else if (percent < 0.8) {
          opacity = 1 - ((1 - 0.9) * (percent - 0.2)) / 0.6;
        } else {
          opacity = 0.9 - ((0.9 - 0.2) * (percent - 0.8)) / 0.2;
        }
        bgColor = `rgba(255, 255, 255, ${opacity.toFixed(2)})`;
      }
      break;
  }
  return bgColor;
};
