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

export const Close = ({
  classNames,
  onClick,
  themeType = 'dark',
}: {
  classNames?: string;
  onClick: () => void;
  themeType?: 'dark' | 'light';
}) => (
  <div
    className={cls(styles.close, classNames, themeType && styles[themeType])}
    onClick={onClick}
  >
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4.96977 17.7929C4.57925 18.1834 4.57925 18.8166 4.96977 19.2071C5.3603 19.5976 5.99346 19.5976 6.38399 19.2071L12.1769 13.4142L17.9698 19.2071C18.3603 19.5976 18.9935 19.5976 19.384 19.2071C19.7745 18.8166 19.7745 18.1834 19.384 17.7929L13.5911 12L19.384 6.20711C19.7745 5.81658 19.7745 5.18342 19.384 4.79289C18.9935 4.40237 18.3603 4.40237 17.9698 4.79289L12.1769 10.5858L6.38399 4.79289C5.99347 4.40237 5.3603 4.40237 4.96978 4.79289C4.57925 5.18342 4.57925 5.81658 4.96978 6.20711L10.7627 12L4.96977 17.7929Z"></path>
    </svg>
  </div>
);
