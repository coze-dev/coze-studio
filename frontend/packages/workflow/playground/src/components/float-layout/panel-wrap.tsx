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

import { useGlobalState } from '../../hooks';

import styles from './panel-wrap.module.less';

interface PanelWrapProps {
  layout?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const PanelWrap: React.FC<React.PropsWithChildren<PanelWrapProps>> = ({
  layout = 'horizontal',
  children,
  className,
  ...props
}) => {
  const { isInIDE } = useGlobalState();

  return (
    <div
      className={cls(styles['panel-wrap'], className, {
        [styles.vertical]: layout === 'vertical' && !isInIDE,
        [styles.horizontal]: layout === 'horizontal' && !isInIDE,
        [styles.vertical_project]: layout === 'vertical' && isInIDE,
        [styles.horizontal_project]: layout === 'horizontal' && isInIDE,
      })}
      {...props}
    >
      {children}
    </div>
  );
};
