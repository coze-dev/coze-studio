import { useEffect } from 'react';

import { type DatabaseField } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { useToggle } from '@coze-arch/hooks';
import { Dropdown, Tooltip } from '@coze/coze-design';

import { DataTypeTag } from '@/node-registries/common/components';
import { AddButton } from '@/form';

interface SelectFieldsButtonProps {
  onSelect?: (id: number) => void;
  selectedFieldIDs?: number[];
  fields?: DatabaseField[];
  filterSystemFields?: boolean;
  readonly?: boolean;
}

const MenuItem = ({
  field,
  onSelect,
}: {
  field: DatabaseField;
  onSelect?: (id: number) => void;
}) => (
  <Dropdown.Item className="!p-0 m-0">
    <Tooltip
      className="!translate-x-[-6px]"
      content={field.name}
      position="left"
    >
      <div
        className="w-[196px] h-[32px] p-[8px] flex items-center justify-between"
        onClick={e => {
          e.stopPropagation();
          onSelect?.(field.id as number);
        }}
      >
        <span className="text-[14px] truncate w-[100px]">{field.name}</span>

        <DataTypeTag type={field.type} />
      </div>
    </Tooltip>
  </Dropdown.Item>
);

export function SelectFieldsButton({
  onSelect,
  selectedFieldIDs = [],
  fields = [],
  filterSystemFields = true,
  readonly = false,
}: SelectFieldsButtonProps) {
  const { state: visible, toggle } = useToggle(false);

  fields = fields?.filter(
    ({ isSystemField, id }) =>
      (!isSystemField || !filterSystemFields) &&
      !selectedFieldIDs?.includes(id),
  );

  const disabled = readonly || !fields || fields.length === 0;

  useEffect(() => {
    if (disabled && visible) {
      toggle();
    }
  }, [disabled, visible]);

  if (disabled) {
    return (
      <Tooltip
        content={I18n.t('workflow_database_no_fields', {}, '没有可添加的字段')}
      >
        <AddButton disabled={disabled} />
      </Tooltip>
    );
  }

  return (
    <Dropdown
      className="max-h-[260px] overflow-auto"
      visible={visible}
      trigger="custom"
      render={
        <Dropdown.Menu>
          {fields.map(field => (
            <MenuItem field={field} onSelect={onSelect} />
          ))}
        </Dropdown.Menu>
      }
      position="bottomRight"
      onClickOutSide={() => toggle()}
    >
      <div onClick={() => toggle()}>
        <AddButton />
      </div>
    </Dropdown>
  );
}
