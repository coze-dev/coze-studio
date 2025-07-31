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

/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import React, {
  useCallback,
  useMemo,
  useState,
  type FC,
  type CSSProperties,
} from 'react';

import classNames from 'classnames';
import { CSS as cssDndKit } from '@dnd-kit/utilities';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  DndContext,
  PointerSensor,
  useSensors,
  useSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  DataTypeSelect,
  getDataTypeOptions,
  getDataTypeText,
} from '@coze-data/utils';
import { OptType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozInfoCircle,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';
import {
  Input,
  Table,
  Tooltip,
  Checkbox,
  type CheckboxProps,
} from '@coze-arch/coze-design';
import { type ColumnProps, type TableProps } from '@coze-arch/bot-semi/Table';
import { UIButton, Typography } from '@coze-arch/bot-semi';
import { IconDragOutlined } from '@coze-arch/bot-icons';
import { type DocTableColumn } from '@coze-arch/bot-api/memory';
import { ColumnType } from '@coze-arch/bot-api/knowledge';

import { type IValidateRes, validateField, useOptFromQuery } from '@/utils';
import { type TableItem } from '@/types/table';
import { type SemanticValidateItem } from '@/types';

import styles from './index.module.less';

type Align = 'center' | 'left' | 'right' | undefined;
enum ValidateStatus {
  Error = 'error',
  Default = 'default',
}

export interface TableStructureProps extends TableProps {
  data: Array<
    DocTableColumn & {
      key?: string;
      autofocus?: boolean;
      errMsg?: string;
    }
  >;
  setData: (v: Array<DocTableColumn>) => void;
  initValid?: boolean;
  isBlurValid?: boolean;
  isPreview?: boolean;
  verifyMap?: SemanticValidateItem;
  baseKey?: string;
  showTitle?: boolean;
  tipsNode?: React.ReactNode;
  isDragTable?: boolean;
}
const NAME_MAX_STR_LEN = 30;
const DESC_MAX_STR_LEN = 2000;
const baseClassName = 'table-structure';
const RequiredColRender = ({
  children,
  tooltip,
  dataTestId,
}: {
  children: React.ReactNode;
  tooltip?: string | React.ReactNode;
  dataTestId?: string;
}) => (
  <div
    className={styles[`${baseClassName}-required-container`]}
    data-testid={dataTestId}
  >
    {children}
    <span className={styles[`${baseClassName}-col-required`]}> *</span>
    {tooltip}
  </div>
);

interface InputRenderProps {
  onChange: (v: string) => void;
  validate?: (v: string, error: string) => IValidateRes;
  record: TableItem & { errMsg?: string };
  value: string;
  autofocus: boolean;
  initValid: boolean;
  isBlurValid: boolean;
  errorMsg?: string;
  isPreview?: boolean;
  placeholder?: string;
  maxStrLen: number;
}
const InputRender = ({
  onChange,
  record,
  value,
  autofocus = false,
  isBlurValid = false,
  initValid,
  validate,
  isPreview,
  placeholder,
  maxStrLen,
}: InputRenderProps) => {
  const ValidateResult = (v: string) => {
    const validRes = validate?.(
      v,
      I18n.t('datasets_segment_tableStructure_field_errEmpty'),
    );
    return {
      valid: initValid ? !!(validate ? validRes?.valid : v && v !== '') : true,
      errorMsg:
        validRes?.errorMsg ||
        I18n.t('datasets_segment_tableStructure_field_errEmpty'),
    };
  };

  const [inputValue, setInputValue] = useState(value);
  const [validObj, setValidObj] = useState(() => {
    const res = ValidateResult(value);
    return {
      valid: isBlurValid ? true : res.valid,
      errorMsg: res.errorMsg,
    };
  });

  const validateValue = (v: string) => {
    const validRes = ValidateResult(v);
    setValidObj(validRes);
  };

  const hasDisable = isPreview;
  const apiErrorMsg = record?.errMsg || '';

  const validateStatus = useMemo(() => {
    if (apiErrorMsg) {
      return ValidateStatus.Error;
    }
    return !validObj.valid ? ValidateStatus.Error : ValidateStatus.Default;
  }, [validObj, apiErrorMsg]);

  const renderErrorMsg = useCallback(() => {
    if (apiErrorMsg) {
      return <div className={styles['input-error-msg']}>{apiErrorMsg}</div>;
    }

    return (
      <>
        {!validObj.valid && (
          <div className={styles['input-error-msg']}>{validObj.errorMsg}</div>
        )}
      </>
    );
  }, [apiErrorMsg, validObj]);

  return (
    <>
      <Input
        autoFocus={autofocus}
        value={inputValue}
        maxLength={maxStrLen}
        onChange={v => {
          setInputValue(v.substring(0, maxStrLen));
          !isBlurValid && validateValue(v);
        }}
        disabled={hasDisable}
        validateStatus={validateStatus}
        suffix={
          <span className={styles['input-suffix']}>
            {(inputValue || '').length}/{maxStrLen}
          </span>
        }
        onBlur={() => {
          onChange(inputValue?.substring(0, maxStrLen) || '');
          validateValue(inputValue);
        }}
        placeholder={placeholder}
      />
      {renderErrorMsg()}
    </>
  );
};

// TODO to be solved
// eslint-disable-next-line @coze-arch/max-line-per-function
export const TableStructure: React.FC<TableStructureProps> = ({
  data = [],
  setData,
  verifyMap = {},
  initValid = false,
  isBlurValid = false,
  isPreview = false,
  baseKey,
  showTitle = false,
  children: childrenNode,
  tipsNode,
  isDragTable = false,
  ...tableProps
}) => {
  const opt = useOptFromQuery();
  const isResegment = opt === OptType.RESEGMENT;

  const columns: ColumnProps<TableItem>[] = [
    {
      title: () => (
        <RequiredColRender
          dataTestId={KnowledgeE2e.TableLocalTableConfigurationIndex}
          tooltip={
            <Tooltip
              className="whitespace-pre-line"
              content={I18n.t('knowledge_multi_index')}
            >
              <UIButton
                size="small"
                theme="borderless"
                type="tertiary"
                style={{
                  marginLeft: 4,
                }}
                icon={<IconCozInfoCircle className="coz-fg-secondary" />}
              />
            </Tooltip>
          }
        >
          <div
            className={styles['table-header-tooltip']}
            data-testid={KnowledgeE2e.TableLocalTableConfigurationIndex}
          >
            <span>{I18n.t('knowledge_table_structure_semantic')}</span>
          </div>
        </RequiredColRender>
      ),
      dataIndex: 'is_semantic',
      width: 90,
      align: 'left' as Align,
      render: (value, record, index: number) => {
        const onChange: CheckboxProps['onChange'] = e => {
          const newData = [...data];
          newData[index].is_semantic = Boolean(e.target.checked);
          setData(newData);
        };
        const { sequence } = record;
        function hasFormItemDisable() {
          const disabled = Object.keys(verifyMap).length
            ? !verifyMap[sequence || index]?.valid
            : false;
          return disabled || isPreview;
        }
        const hasDisable = hasFormItemDisable();

        const Wrapper = ({ children }: { children: JSX.Element }) => {
          if (hasDisable && verifyMap[sequence || index]?.msg) {
            return (
              <Tooltip
                trigger="hover"
                content={verifyMap[sequence || index]?.msg}
              >
                {children}
              </Tooltip>
            );
          }
          return children;
        };

        return (
          <div className={styles['semantic-radio']}>
            {isDragTable ? (
              <IconDragOutlined className={'structure-table-drag-icon'} />
            ) : null}
            <Wrapper>
              <Checkbox
                checked={value}
                disabled={hasDisable}
                onChange={onChange}
                data-testid={KnowledgeE2e.TableStructureIndexCheckbox}
              />
            </Wrapper>
          </div>
        );
      },
    },
    {
      title: () => (
        <RequiredColRender
          dataTestId={KnowledgeE2e.TableLocalTableConfigurationColumnName}
        >
          {I18n.t('knowledge_table_structure_column_name')}
        </RequiredColRender>
      ),
      dataIndex: 'column_name',
      align: 'left' as Align,
      render: (value, record, index) => {
        const { autofocus = false } = record;
        const onChange = (v: string) => {
          const newData = [...data];
          newData[index].column_name = v;
          setData(newData);
        };

        const validateFn = (v: string, emptyMsg: string) => {
          if (data?.filter(i => i.column_name === v).length >= 2) {
            return {
              valid: false,
              errorMsg: I18n.t('Manual_crawling_040'),
            };
          }
          return validateField(v, emptyMsg);
        };

        return (
          <div className={styles['column-item']}>
            <InputRender
              initValid={initValid}
              isBlurValid={isBlurValid}
              key={`${baseKey}${record?.sequence}`}
              onChange={onChange}
              record={record}
              value={value}
              validate={validateFn}
              autofocus={autofocus}
              isPreview={isPreview}
              maxStrLen={NAME_MAX_STR_LEN}
            />
          </div>
        );
      },
    },
    {
      title: () => (
        <div data-testid={KnowledgeE2e.TableLocalTableConfigurationDesc}>
          {I18n.t('knowledge_table_structure_desc')}
        </div>
      ),
      dataIndex: 'desc',
      align: 'left' as Align,
      render: (value, record, index) => {
        const onChange = (v: string) => {
          const newData = [...data];
          newData[index].desc = v;
          setData(newData);
        };

        return (
          <div className={styles['column-item']}>
            <InputRender
              initValid={false}
              isBlurValid={false}
              key={`column-desc.${baseKey}${record?.sequence}`}
              placeholder={I18n.t('knowledge_variable_description_placeholder')}
              onChange={onChange}
              record={record}
              value={value}
              autofocus={false}
              isPreview={isPreview}
              maxStrLen={DESC_MAX_STR_LEN}
            />
          </div>
        );
      },
    },
    {
      title: () => (
        <RequiredColRender
          dataTestId={KnowledgeE2e.TableLocalTableConfigurationType}
        >
          {I18n.t('knowledge_table_structure_data_type')}
        </RequiredColRender>
      ),
      dataIndex: 'column_type',
      align: 'left' as Align,
      render: (value, record, index) => {
        const valid = isBlurValid ? true : !!value;

        return (
          <div
            className={`pr-[16px] ${styles['column-item']}`}
            key={record.sequence}
          >
            {isPreview ? (
              <Typography.Text className={styles['column-item-value']}>
                {getDataTypeText(value)}
              </Typography.Text>
            ) : (
              <DataTypeSelect
                value={value || ''}
                selectProps={{
                  disabled: !record.is_new_column && isResegment,
                  optionList: getDataTypeOptions().map(option => {
                    if (option.value === ColumnType.Image) {
                      return {
                        ...option,
                        disabled: record.is_semantic,
                      };
                    }
                    return option;
                  }),
                  placeholder: I18n.t('db_table_save_exception_fieldtype'),
                }}
                errorMsg={
                  valid
                    ? undefined
                    : I18n.t(
                        'datasets_segment_tableStructure_field_type_errEmpty',
                      )
                }
                handleChange={v => {
                  const newData = [...data];
                  newData[index].column_type = v as ColumnType;
                  setData(newData);
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: (
        <div data-testid={KnowledgeE2e.TableLocalTableConfigurationAction}>
          {I18n.t('datasets_unit_upload_field_action')}
        </div>
      ),
      dataIndex: 'operate',
      width: 82,
      align: 'left' as Align,
      render: (_text, record, index) => (
        <div
          className={styles['column-item-action']}
          onClick={() => {
            setData(data.filter((_, i) => index !== i));
          }}
        >
          <Tooltip
            content={I18n.t(
              record.is_semantic
                ? 'datasets_segment_tableStructure_delTips'
                : 'datasets_table_title_actions_delete',
            )}
          >
            <IconCozTrashCan
              aria-disabled={Boolean(record.is_semantic)}
              className={styles['column-item-action-delete']}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // In the preview scenario, no operation column is required
  if (isPreview) {
    columns.pop();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 1 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const items = Array.from(data);
      const activeIndex = items.findIndex(item => item.key === active.id);
      const overIndex = items.findIndex(item => item.key === over.id);
      setData(arrayMove(items, activeIndex, overIndex));
    }
  };

  const SortableRow: FC<{
    className: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'data-row-key': string;
    style: CSSProperties;
  }> = props => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: props['data-row-key'],
    });
    const style: CSSProperties = {
      ...props.style,
      transform: cssDndKit.Transform.toString(transform),
      transition,
      cursor: isDragging ? 'grabbing' : 'grab',
      ...(isDragging
        ? {
            zIndex: 999,
            position: 'relative',
            background: 'rgba(217, 220, 250, 1)',
          }
        : {}),
    };

    return (
      <tr
        {...props}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      ></tr>
    );
  };

  const renderTableContent = () => {
    if (isDragTable) {
      return (
        <DndContext
          // https://docs.dndkit.com/api-documentation/context-provider#autoscroll
          autoScroll={true}
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map(item => item.key || '')}
            strategy={verticalListSortingStrategy}
          >
            <Table
              wrapperClassName={classNames(
                styles[`${baseClassName}-wrapper`],
                styles['drag-table'],
              )}
              key={baseKey}
              tableProps={{
                sticky: true,
                dataSource: data,
                columns,
                pagination: false,
                className: styles[baseClassName],
                components: {
                  body: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    row: SortableRow as any,
                  },
                },
                ...tableProps,
              }}
            />
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <Table
        wrapperClassName={styles[`${baseClassName}-wrapper`]}
        key={baseKey}
        tableProps={{
          sticky: true,
          dataSource: data,
          columns,
          pagination: false,
          className: styles[baseClassName],
          ...tableProps,
        }}
      />
    );
  };

  return (
    <div className={styles['structure-wrapper']}>
      {showTitle ? <TableStructureTitle /> : null}
      {tipsNode ? tipsNode : null}
      {renderTableContent()}
      {childrenNode}
    </div>
  );
};

export const TableStructureTitle = () => (
  <div
    className={styles['table-structure-bar-title']}
    data-testid={KnowledgeE2e.TableLocalTableStructureTitle}
  >
    <span>{I18n.t('datasets_segment_tableStructure_title')}</span>
    <Tooltip content={I18n.t('knowledge_table_structure_column_tooltip')}>
      <IconCozInfoCircle
        className={classNames(styles.icon, 'coz-fg-secondary')}
      />
    </Tooltip>
  </div>
);
