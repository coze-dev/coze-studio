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

import {
  type RefObject,
  useEffect,
  useRef,
  type FC,
  type PropsWithChildren,
} from 'react';

import cs from 'classnames';
import { useDnDSortableItem } from '@coze-studio/components/sortable-list-hooks';
import { type OnMove } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { Switch } from '@coze-arch/coze-design';
import { type TooltipProps } from '@coze-arch/bot-semi/Tooltip';
import {
  type ColumnProps,
  type TableComponents,
} from '@coze-arch/bot-semi/Table';
import { Form, IconButton, Tooltip } from '@coze-arch/bot-semi';
import { IconShortcutTrash, IconSvgShortcutDrag } from '@coze-arch/bot-icons';
import {
  shortcut_command,
  type ToolInfo,
} from '@coze-arch/bot-api/playground_api';

import { type UploadItemType } from '../../../utils/file-const';
import { type ComponentsWithId } from './types';
import {
  getComponentTypeFormBySubmitField,
  getSubmitFieldFromComponentTypeForm,
  isSwitchDisabled,
  modifyComponentWhenSwitchChange,
} from './method';
import { ComponentTypeSelectRecordItem } from './component-type-select';
import { ComponentParameter } from './component-parameter';
import { ComponentDefaultValue } from './component-default-value';

type ColumnPropType = ColumnProps<ComponentsWithId>;

const TooltipWithDisabled: FC<TooltipProps & { disabled?: boolean }> = ({
  disabled,
  children,
  ...props
}) => (disabled ? <>{children}</> : <Tooltip {...props}>{children}</Tooltip>);

const getOperationColumns = ({
  components,
  onChange,
  toolType,
  disabled,
  toolInfo,
}: GetColumnsParams): ColumnPropType => {
  const deleteable = !disabled;
  const showDelete = toolType === undefined;

  return {
    key: 'operation',
    title: null,
    width: showDelete ? '80px' : '40px',
    render: (_, record) => (
      <div className="flex items-center pl-[12px]">
        <Switch
          checked={!record.hide}
          disabled={isSwitchDisabled({
            components,
            record,
            toolInfo,
          })}
          size="mini"
          onChange={checked =>
            onChange?.(
              modifyComponentWhenSwitchChange({
                components,
                record,
                checked,
              }),
            )
          }
        />
        {showDelete ? (
          <div className="px-2">
            <TooltipWithDisabled
              content={I18n.t('Remove')}
              disabled={!deleteable}
            >
              <IconButton
                size="small"
                theme="borderless"
                type="tertiary"
                disabled={!deleteable}
                icon={<IconShortcutTrash />}
                onClick={() => {
                  onChange?.(components.filter(item => item.id !== record.id));
                }}
              />
            </TooltipWithDisabled>
          </div>
        ) : null}
      </div>
    ),
  };
};

const getColumnsMap = (params: GetColumnsParams) => {
  const { components, disabled } = params;
  const sortable = components.length > 1 && !disabled;

  return {
    name: {
      key: 'name',
      title: (
        <Form.Label
          className="leading-5 p-0 m-0"
          text={I18n.t('shortcut_modal_component_name')}
          required
        />
      ),
      width: 1,
      render: (_, record, index) => (
        <div className="flex items-center">
          <div
            id={handleId}
            className={cs(
              'px-[2px]',
              sortable ? 'cursor-grab' : 'cursor-not-allowed',
            )}
          >
            <IconSvgShortcutDrag />
          </div>
          <Form.Input
            noLabel
            maxLength={20}
            field={`values.[${index}].name`}
            noErrorMessage
            placeholder={I18n.t('shortcut_modal_component_name')}
            rules={[
              {
                required: true,
              },
            ]}
            disabled={disabled || record.hide}
          />
        </div>
      ),
    },
    description: {
      key: 'description',
      title: (
        <Form.Label
          className="leading-5 p-0 m-0"
          text={I18n.t('Description')}
        />
      ),
      width: '190px',
      render: (_, record, index) => (
        <div className="pl-[2px]">
          <Form.Input
            noLabel
            maxLength={100}
            field={`values.[${index}].description`}
            noErrorMessage
            placeholder={I18n.t('Description')}
            disabled={disabled || record.hide}
          />
        </div>
      ),
    },
    inputType: {
      key: 'input_type',
      title: (
        <Form.Label
          className="leading-5 p-0 m-0"
          text={I18n.t('shortcut_modal_component_type')}
          required
        />
      ),
      render: (_, record, index) => (
        <div className="pl-[2px]">
          <ComponentTypeSelectRecordItem
            value={getComponentTypeFormBySubmitField({
              input_type: record.input_type,
              options: record.options,
              upload_options: record.upload_options as UploadItemType[],
            })}
            disabled={disabled || record.hide}
            onSubmit={value => {
              const { input_type, options, upload_options } =
                getSubmitFieldFromComponentTypeForm(value);
              params?.onChange?.(
                params.components.map((item, i) =>
                  i === index
                    ? {
                        ...item,
                        input_type,
                        options,
                        default_value: {
                          value: '',
                        },
                        upload_options,
                      }
                    : item,
                ),
              );
            }}
          />
        </div>
      ),
    },
    defaultValue: {
      key: 'default_value',
      title: (
        <Form.Label
          className="leading-5 p-0 m-0"
          text={I18n.t('shortcut_modal_use_tool_parameter_default_value')}
        />
      ),
      render: (_, record, index) => (
        <div className="pl-[2px] max-w-[136px]">
          <ComponentDefaultValue
            componentType={getComponentTypeFormBySubmitField({
              input_type: record.input_type,
              options: record.options,
              upload_options: record.upload_options as UploadItemType[],
            })}
            field={`values.[${index}].default_value`}
            disabled={disabled || record.hide}
          />
        </div>
      ),
    },
    parameter: {
      key: 'parameter',
      title: (
        <Form.Label
          className="leading-5 p-0 m-0"
          text={I18n.t('shortcut_modal_component_plugin_wf_parameter')}
        />
      ),
      dataIndex: 'parameter',
      render: text => (
        <ComponentParameter toolInfo={params.toolInfo} parameter={text} />
      ),
    },
    operations: getOperationColumns(params),
  } satisfies Record<string, ColumnPropType>;
};

interface GetColumnsParams {
  components: ComponentsWithId[];
  onChange?: (values: ComponentsWithId[]) => void;
  toolType?: shortcut_command.ToolType;
  disabled: boolean;
  toolInfo: ToolInfo;
}

const assignWidth = (base: ColumnPropType, width: string | number) =>
  Object.assign({}, base, { width });

export const getColumns = (params: GetColumnsParams): ColumnPropType[] => {
  const { toolType } = params;
  const columnsMap = getColumnsMap(params);
  if (
    toolType === shortcut_command.ToolType.ToolTypePlugin ||
    toolType === shortcut_command.ToolType.ToolTypeWorkFlow
  ) {
    return [
      assignWidth(columnsMap.name, '103px'),
      assignWidth(columnsMap.description, '103px'),
      assignWidth(columnsMap.inputType, '103px'),
      assignWidth(columnsMap.defaultValue, '126px'),
      assignWidth(columnsMap.parameter, '86px'),
      columnsMap.operations,
    ];
  }
  return [
    assignWidth(columnsMap.name, '125px'),
    assignWidth(columnsMap.description, '125px'),
    assignWidth(columnsMap.inputType, '125px'),
    assignWidth(columnsMap.defaultValue, '136px'),
    columnsMap.operations,
  ];
};

const type = Symbol.for(
  'chat-area-plugins-chat-shortcuts-components-table-item',
);
const handleId = 'chat-area-plugins-chat-shortcuts-components-drag-handle';
const DraggableBodyRow: FC<
  PropsWithChildren<{
    id: string;
    sortable: boolean;
    onMove: OnMove<string>;
  }>
> = ({ id, onMove, children, sortable }) => {
  // Because the name may be empty, take shortid as a bottom line here.
  const dropRef = useRef<HTMLElement>(null);
  const { connect } = useDnDSortableItem<string>({
    type,
    id,
    onMove,
    enabled: sortable,
  });
  useEffect(() => {
    // In order to avoid complicated cross-component value transfer, here is a little direct manipulation of the DOM, I'm very sorry.
    const handleRef = {
      current: (dropRef.current?.querySelector(`#${handleId}`) ??
        null) as HTMLElement | null,
    };
    connect(dropRef, handleRef);
  }, []);
  return <tr ref={dropRef as RefObject<HTMLTableRowElement>}>{children}</tr>;
};

export const tableComponents = {
  body: {
    // The type definition exported by semi-ui is very irresponsible
    row: DraggableBodyRow,
  },
} as unknown as TableComponents;
