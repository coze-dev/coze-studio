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

import { type ReactNode, type PropsWithChildren } from 'react';

import classNames from 'classnames';

import styles from './card.module.less';

export interface ProjectTemplateGroupProps {
  title: ReactNode | undefined;
  groupChildrenClassName?: string;
}

export const ProjectTemplateGroup: React.FC<
  PropsWithChildren<ProjectTemplateGroupProps>
> = ({ title, groupChildrenClassName, children }) => (
  <div>
    <div className="mb-8px coz-fg-plus text-[16px] font-medium leading-[22px]">
      {title}
    </div>
    <div
      className={classNames(
        'grid',
        styles['template-group'],
        groupChildrenClassName,
      )}
    >
      {children}
    </div>
  </div>
);
