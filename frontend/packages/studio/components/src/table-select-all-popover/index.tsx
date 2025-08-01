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

import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Checkbox } from '@coze-arch/coze-design';

const wrapperStyle = classNames(
  'fixed left-[50%] translate-x-[-50%] bottom-[30px]',
  'min-w-[324px] max-w-fit h-[48px]',
  'flex items-center gap-[12px]',
  'rounded-[8px] coz-bg-max border border-solid coz-stroke-plus coz-shadow-large',
  'pl-[16px] pr-[8px]',
);

export const TableSelectAllPopover: FC<
  PropsWithChildren<{
    selectedIds: string[];
    totalIds: string[];
    onSelectChange: (val: string[]) => void;
    renderCount?: boolean;
  }>
> = ({
  selectedIds,
  totalIds,
  onSelectChange,
  renderCount = true,
  children,
}) => {
  const isAllChecked = totalIds.every(id => selectedIds.includes(id));
  const isIndeterminate = !isAllChecked && !!selectedIds.length;

  return selectedIds.length ? (
    <div className={wrapperStyle}>
      <Checkbox
        checked={isAllChecked}
        indeterminate={isIndeterminate}
        onChange={e => {
          onSelectChange(e.target.checked ? totalIds : []);
        }}
      >
        {I18n.t('publish_permission_control_page_remove_choose_all')}
      </Checkbox>
      {/* Make sure there is a minimum interval between Select All and the right area */}
      <div className="flex-1 min-w-[40px]" />
      {renderCount ? (
        <div>
          {I18n.t('publish_permission_control_page_remove_chosen')}{' '}
          {selectedIds.length ?? 0}
        </div>
      ) : null}
      {children}
    </div>
  ) : null;
};
