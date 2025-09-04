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

import cls from 'classnames';

import styles from './index.module.less';

export const Spin = ({ classNames }: { classNames?: string }) => (
  <div
    className={cls(styles.spin, classNames)}
    style={{
      color: 'rgba(0,100,250, 1)',
    }}
  >
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-icon="spin"
    >
      <defs>
        <linearGradient
          x1="0%"
          y1="100%"
          x2="100%"
          y2="100%"
          id="linearGradient-17"
        >
          <stop stop-color="currentColor" stop-opacity="0" offset="0%"></stop>
          <stop
            stop-color="currentColor"
            stop-opacity="0.50"
            offset="39.9430698%"
          ></stop>
          <stop stop-color="currentColor" offset="100%"></stop>
        </linearGradient>
      </defs>
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <rect
          fill-opacity="0.01"
          fill="none"
          x="0"
          y="0"
          width="36"
          height="36"
        ></rect>
        <path
          d="M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951"
          stroke="url(#linearGradient-17)"
          stroke-width="4"
          stroke-linecap="round"
        ></path>
      </g>
    </svg>
  </div>
);
