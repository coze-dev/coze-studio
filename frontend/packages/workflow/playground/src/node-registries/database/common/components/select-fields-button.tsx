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

import { useEffect } from 'react';

import { useNodeTestId, type DatabaseField } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { useToggle } from '@coze-arch/hooks';
import { Dropdown, Tooltip } from '@coze-arch/coze-design';

import { DataTypeTag } from '@/node-registries/common/components';
import { AddButton } from '@/form';

interface SelectFieldsButtonProps {
  onSelect?: (id: number) => void;
  selectedFieldIDs?: number[];
  fields?: DatabaseField[];
  filterSystemFields?: boolean;
  readonly?: boolean;
  testName?: string;
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
  testName,
}: SelectFieldsButtonProps) {
  const { state: visible, toggle } = useToggle(false);
  const { getNodeSetterId } = useNodeTestId();
  const addButtonTestId = getNodeSetterId(
    testName || 'select-fileds-add-button',
  );

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
        <AddButton dataTestId={addButtonTestId} />
      </div>
    </Dropdown>
  );
}
