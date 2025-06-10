import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Checkbox } from '@coze/coze-design';

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
      {/* 确保全选和右侧区域有一个最小间隔 */}
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
