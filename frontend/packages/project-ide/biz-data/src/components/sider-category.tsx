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
import { IconCozKnowledgeFill } from '@coze-arch/coze-design/icons';

interface SiderCategoryProps {
  label: string;
  selected: boolean;

  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const SiderCategory = ({ label, onClick, selected }: SiderCategoryProps) => (
  <div
    onClick={onClick}
    className={classNames([
      'flex items-center gap-[8px] px-[12px]',
      'px-[12px] py-[6px] rounded-[8px]',
      'cursor-pointer',
      'hover:text-[var(--light-usage-text-color-text-0,#1c1f23)]',
      'hover:bg-[var(--light-usage-fill-color-fill-0,rgba(46,50,56,5%))]',
      selected &&
        'text-[var(--light-usage-text-color-text-0,#1c1d23)] bg-[var(--light-usage-fill-color-fill-0,rgba(46,47,56,5%))]',
    ])}
  >
    <IconCozKnowledgeFill />
    {label}
  </div>
);

export default SiderCategory;
