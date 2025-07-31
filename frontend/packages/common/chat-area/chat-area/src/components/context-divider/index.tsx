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

import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { usePreference } from '../../context/preference';

import styles from './index.module.less';

interface ContextDividerProps {
  text?: string;
}

export const ContextDivider = ({ text }: ContextDividerProps) => {
  const { messageWidth } = usePreference();
  const showBackground = useShowBackGround();

  return (
    <div className={styles.divider} style={{ width: messageWidth }}>
      <div
        className={classNames(
          styles['divider-line'],
          styles['coz-divider-line-style'],
          {
            '!coz-bg-images-secondary': showBackground,
          },
        )}
      ></div>
      <div
        className={classNames(styles['divider-text'], 'coz-fg-dim', {
          '!coz-fg-images-secondary': showBackground,
        })}
      >
        {text}
      </div>
      <div
        className={classNames(
          styles['divider-line'],
          // UI requires special handling of divider color, no token is used
          styles['coz-divider-line-style'],
          {
            '!coz-bg-images-secondary': showBackground,
          },
        )}
      ></div>
    </div>
  );
};

ContextDivider.displayName = 'ChatAreaContextDivider';
