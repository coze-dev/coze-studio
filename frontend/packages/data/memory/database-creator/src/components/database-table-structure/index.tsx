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
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  type FC,
  type MutableRefObject,
  useCallback,
  useMemo,
} from 'react';

import { nanoid } from 'nanoid';
import { noop } from 'lodash-es';
import classNames from 'classnames';
import { useBoolean } from 'ahooks';
import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { BotE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  UITable,
  UITableAction,
  Button,
  Switch,
  Tooltip,
  Image,
  Form,
  Banner,
  withField,
  Popover,
  Spin,
  Icon,
  Row,
  Col,
} from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import { isApiError } from '@coze-arch/bot-http';
import {
  type InsertBotTableRequest,
  BotTableRWMode,
  type FieldItemType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { SLSelect } from '../singleline-select';
import { SLInput } from '../singleline-input';
import {
  type TriggerType,
  type TableFieldsInfo,
  type TableBasicInfo,
  type ReadAndWriteModeOptions,
  type CreateType,
  type OnSave,
} from '../../types';
import {
  DATABASE_CONTENT_CHECK_ERROR_CODE,
  DATABASE_CONTENT_CHECK_ERROR_CODE_NEW,
  FIELD_TYPE_OPTIONS,
  RW_MODE_OPTIONS_CONFIG,
  RW_MODE_OPTIONS_MAP,
  SYSTEM_FIELDS,
} from '../../const';
import keyExample from '../../assets/key-example.png';
import { ReactComponent as InfoSVG } from '../../assets/icon_info_outlined.svg';
import { validateFields, validateNaming } from './helpers/validate';
import { KeyTipsNode } from './components/KeyTipsNode';
import { ColumnHeader } from './components/ColumnHeader';

import s from './index.module.less';

const MIN_COL = 12;
const MAX_COL = 24;
const MAX_COLUMNS = 20;

export interface DatabaseTableStructureProps {
  data: DatabaseInfo;
  botId: string;
  forceEdit?: boolean;
  loading?: boolean;
  loadingTips?: string;
  /**
   * Excel: single user mode | read-only mode
   * Normal: Single user mode | Read-only mode
   * Expert: Single user mode | Read-only mode | Multi-user mode
   * Undefined: Read and write modes are not supported
   */
  readAndWriteModeOptions?: ReadAndWriteModeOptions;
  enableAdd?: boolean;
  maxColumnNum?: number;

  useComputingEnableGoToNextStep?: (list: TableFieldsInfo) => void;
  onCancel?: () => void;
  onSave?: OnSave;
  onDeleteField?: (list: TableFieldsInfo) => void;
  setContentCheckErrorMsg?: (s: string) => void;

  createType: CreateType;
}

export interface DatabaseTableStructureRef {
  validate: () => Promise<boolean>;
  submit: () => Promise<void>;
  isReadonly: boolean;
  setTableFieldsList: (list: TableFieldsInfo) => void;
  tableFieldsList: TableFieldsInfo;
  tableBasicInfoFormRef: MutableRefObject<Form<TableBasicInfo>>;
}

export const DatabaseTableStructure = forwardRef<
  DatabaseTableStructureRef,
  DatabaseTableStructureProps
>((props, ref) => {
  const {
    data: initialData,
    botId,
    onSave,
    onCancel,
    onDeleteField,
    forceEdit = false,
    maxColumnNum = MAX_COLUMNS,
    useComputingEnableGoToNextStep,
    readAndWriteModeOptions,
    enableAdd = true,
    loading = false,
    setContentCheckErrorMsg = noop,
    loadingTips,
    createType,
  } = props;
  const getDefaultTableFieldsList = () => {
    if (initialData.readAndWriteMode === BotTableRWMode.UnlimitedReadWrite) {
      return [...SYSTEM_FIELDS, ...initialData.tableMemoryList];
    }
    return initialData.tableMemoryList;
  };

  const [tableFieldsList, setTableFieldsList] = useState<TableFieldsInfo>(
    getDefaultTableFieldsList(),
  );

  const inputRef = useRef<{
    triggerFocus?: () => void;
  }>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableBasicInfoFormRef = useRef<Form<TableBasicInfo>>();

  const isModify = Boolean(initialData.tableId);
  const [isReadonly, { setTrue: enableReadonly, setFalse: disableReadonly }] =
    useBoolean(false);
  const isRowMaxLimit = tableFieldsList.length >= maxColumnNum;
  const isExceedRowMaxLimit = tableFieldsList.length > maxColumnNum;
  const isEmptyList = !tableFieldsList
    .filter(i => !i.isSystemField)
    .filter(i => i.name || i.desc || i.type).length;
  const databaseAuditErrorCodes = [
    DATABASE_CONTENT_CHECK_ERROR_CODE,
    DATABASE_CONTENT_CHECK_ERROR_CODE_NEW,
  ];
  const handleContentCheckError = (error: Error) => {
    if (
      isApiError(error) &&
      databaseAuditErrorCodes.includes(Number(error?.code))
    ) {
      setContentCheckErrorMsg(
        error?.msg || I18n.t('knowledge_bot_update_databse_tnserr_msg'),
      );
    }
  };

  const handleAdd = (triggerFocus = true) => {
    if (isReadonly) {
      return;
    }
    const newTableFieldsList = [
      ...tableFieldsList,
      {
        nanoid: nanoid(),
        name: '',
        desc: '',
        type: undefined as unknown as FieldItemType,
        must_required: false,
      },
    ];

    setTableFieldsList(newTableFieldsList);

    if (triggerFocus) {
      setTimeout(() => {
        inputRef.current?.triggerFocus?.();
        scrollRef.current?.scrollIntoView({
          block: 'end',
          behavior: 'smooth',
        });
      }, 100);
    }
  };

  const verifyTableFields = (trigger: TriggerType) => {
    setTableFieldsList(newTableFieldsList =>
      validateFields(newTableFieldsList, trigger),
    );
  };

  const verifyAllBeforeSave = async (): Promise<boolean> => {
    // Trigger tableFields validation
    const validatedTableFieldsList = validateFields(tableFieldsList, 'save');
    setTableFieldsList(validatedTableFieldsList);

    // Trigger and validate tableBasicInfo
    try {
      // @ts-expect-error -- linter-disable-autofix
      await tableBasicInfoFormRef.current.formApi.validate(['name']);
    } catch (error) {
      return false;
    }

    // Validation tableFields
    if (
      validatedTableFieldsList.find(i =>
        Object.keys(i.errorMapper || {}).find(
          j => !!i?.errorMapper?.[j]?.length,
        ),
      )
    ) {
      return false;
    }

    // Verify that tableFields is empty
    if (isEmptyList) {
      return false;
    }
    return true;
  };

  const save = async () => {
    // @ts-expect-error -- linter-disable-autofix
    const tableBasicInfo = tableBasicInfoFormRef.current.formApi.getValues();

    if (isModify) {
      sendTeaEvent(EVENT_NAMES.edit_table_click, {
        need_login: true,
        have_access: true,
        bot_id: botId,
        table_name: tableBasicInfo.name,
      });
    } else {
      sendTeaEvent(EVENT_NAMES.create_table_click, {
        need_login: true,
        have_access: true,
        bot_id: botId,
        table_name: tableBasicInfo.name,
        database_create_type: createType,
      });
    }

    let resp;
    const params: InsertBotTableRequest['bot_table'] = {
      bot_id: botId,
      table_name: tableBasicInfo.name,
      table_desc: tableBasicInfo.desc || '',
      extra_info: {
        prompt_disabled: String(tableBasicInfo.prompt_disabled ? false : true),
      },
      field_list: tableFieldsList
        .filter(i => !!i.name && !i.isSystemField)
        .map(i => ({
          name: i.name,
          desc: i.desc || '',
          type: i.type,
          must_required: i.must_required,
          id: i.id,
          alterId: i.alterId,
        })),
      rw_mode: tableBasicInfo.readAndWriteMode,
    };

    if (!isModify) {
      try {
        resp = await MemoryApi.InsertBotTable({
          bot_table: params,
        });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseAddTable,
          error: error as Error,
        });
        handleContentCheckError(error as Error);
        return;
      }
    } else {
      try {
        resp = await MemoryApi.AlterBotTable({
          bot_table: {
            ...params,
            id: initialData.tableId,
          },
        });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseAlterTable,
          error: error as Error,
        });
        handleContentCheckError(error as Error);
        return;
      }
    }
    if (onSave) {
      await onSave({
        response: resp,
      });
    }
    onCancel?.();
  };

  const handleSave = async () => {
    try {
      enableReadonly();

      const validateRes = await verifyAllBeforeSave();
      if (!validateRes) {
        return;
      }

      await save();
    } finally {
      disableReadonly();
    }
  };

  const getTableNameErrorMessage = (v: string) => {
    if (!v) {
      return I18n.t('db_add_table_name_tips');
    }
    const errList = validateNaming(v);
    if (errList.length > 0) {
      return errList.join('; ');
    }
  };

  // Initialize ref attribute
  useImperativeHandle<DatabaseTableStructureRef, DatabaseTableStructureRef>(
    ref,
    () => ({
      async submit() {
        return await handleSave();
      },
      async validate() {
        const res = await verifyAllBeforeSave();
        return res;
      },
      setTableFieldsList,
      isReadonly,
      // @ts-expect-error -- linter-disable-autofix
      tableBasicInfoFormRef,
      tableFieldsList,
    }),
    [isReadonly, tableFieldsList, tableBasicInfoFormRef],
  );

  // Custom form item component
  const FormInputInner: FC<any> = useCallback(
    p => {
      const { onChange, value, onBlur, validateStatus } = p;
      const errorMessage =
        validateStatus === 'error' ? getTableNameErrorMessage(value) : '';
      return (
        <SLInput
          value={value}
          handleChange={onChange}
          handleBlur={onBlur}
          inputProps={{
            'data-testid': BotE2e.BotDatabaseAddModalTableNameInput,
            disabled: !forceEdit && (isReadonly || isModify),
            placeholder: I18n.t('db_add_table_name_tips'),
          }}
          onFocusPopoverProps={{
            position: 'left',
            content: <KeyTipsNode />,
          }}
          errorMsgFloat
          errorMsg={errorMessage}
          className={classNames({
            [s['form-input-error']]: validateStatus === 'error',
          })}
        />
      );
    },
    [isReadonly, isModify, forceEdit],
  );
  const FormInput = useMemo(
    () =>
      withField(FormInputInner, {
        valueKey: 'value',
        onKeyChangeFnName: 'onChange',
      }),
    [],
  );

  // Verify that the Next button is disabled
  useComputingEnableGoToNextStep?.(tableFieldsList);

  const dataSource = enableAdd
    ? [...tableFieldsList, { operate: 'add' }]
    : tableFieldsList;

  const resetContentCheckErrorMsg = () => {
    setContentCheckErrorMsg('');
  };

  return loading ? (
    <Spin
      style={{ height: '100%', width: '100%' }}
      tip={loadingTips}
      wrapperClassName={s.spin}
    />
  ) : (
    <div className={s['table-structure-wrapper']}>
      <Form<TableBasicInfo>
        // @ts-expect-error -- linter-disable-autofix
        ref={tableBasicInfoFormRef}
        layout="vertical"
        initValues={{
          name: initialData.name,
          desc: initialData.desc,
          prompt_disabled: isModify
            ? initialData.extra_info?.prompt_disabled === 'true'
              ? false
              : true
            : true,
          readAndWriteMode:
            initialData.readAndWriteMode || BotTableRWMode.LimitedReadWrite,
        }}
        className={s['table-structure-form']}
        onValueChange={(values, changedV) => {
          if ('name' in changedV || 'desc' in changedV) {
            resetContentCheckErrorMsg();
          }
          if (values.readAndWriteMode === BotTableRWMode.UnlimitedReadWrite) {
            setTableFieldsList(state => {
              if (state.some(i => i.isSystemField)) {
                return state;
              }
              return [...SYSTEM_FIELDS, ...state];
            });
          } else if (
            values.readAndWriteMode === BotTableRWMode.LimitedReadWrite
          ) {
            setTableFieldsList(state => {
              if (state.some(i => i.isSystemField)) {
                return state.filter(i => !i.isSystemField);
              }
              return state;
            });
          }
        }}
      >
        <FormInput
          field="name"
          label={{
            text: I18n.t('db_add_table_name'),
            required: true,
          }}
          // @ts-expect-error -- linter-disable-autofix
          validate={v => getTableNameErrorMessage(v)}
          noErrorMessage
          trigger={['change', 'blur']}
          fieldClassName={s['table-name-form-field']}
        />
        <Form.TextArea
          data-testid={BotE2e.BotDatabaseAddModalTableDescInput}
          field="desc"
          label={I18n.t('db_add_table_desc')}
          disabled={isReadonly}
          rows={2}
          placeholder={I18n.t('db_add_table_desc_tips')}
          fieldClassName={s['table-desc-form-field']}
        />
        <Row type="flex" justify="space-between">
          <Col span={12}>
            {readAndWriteModeOptions ? (
              <Form.Select
                data-testid={BotE2e.BotDatabaseAddModalTableQueryModeSelect}
                field="readAndWriteMode"
                style={{ width: '267px' }}
                label={{
                  text: I18n.t('db_table_0129_001'),
                  extra: (
                    <Popover
                      className={s.read_mode_popover}
                      content={
                        <div>
                          <article>
                            {RW_MODE_OPTIONS_MAP[readAndWriteModeOptions].map(
                              i => (
                                <p className={s['th-tip-dot']}>
                                  {RW_MODE_OPTIONS_CONFIG[i].tips}
                                </p>
                              ),
                            )}
                          </article>
                        </div>
                      }
                      position="top"
                      showArrow
                    >
                      <Icon
                        svg={<InfoSVG />}
                        className={s['form-item-label-tooltip-icon']}
                      />
                    </Popover>
                  ),
                }}
                dropdownClassName={s['table-setting-option']}
                optionList={RW_MODE_OPTIONS_MAP[readAndWriteModeOptions].map(
                  i => ({
                    label: RW_MODE_OPTIONS_CONFIG[i].label,
                    value: i,
                  }),
                )}
              />
            ) : null}
          </Col>
          <Col span={readAndWriteModeOptions ? MIN_COL : MAX_COL}>
            <Form.Checkbox
              style={{
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className={s['form-item-checkbox']}
              labelPosition="left"
              field="prompt_disabled"
              label={{
                style: {
                  fontSize: '14px',
                  fontWeight: 400,
                  padding: '0 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--Light-usage-text---color-text-0, #1D1C23)',
                },
                text: I18n.t('database_240618_01'),
                extra: (
                  <Popover
                    className={s.prompt_disabled_popover}
                    content={I18n.t('database_240520_03')}
                    position="top"
                    showArrow
                  >
                    <Icon
                      svg={<InfoSVG />}
                      className={s['form-item-label-tooltip-icon']}
                    />
                  </Popover>
                ),
              }}
            ></Form.Checkbox>
          </Col>
        </Row>
      </Form>

      {isExceedRowMaxLimit ? (
        <Banner
          type="warning"
          description={I18n.t('db_table_0126_027', {
            ColumNum: maxColumnNum,
          })}
          className={s['max-row-banner']}
        />
      ) : null}

      <UITable
        tableProps={{
          columns: [
            {
              dataIndex: 'name',
              title: (
                <ColumnHeader
                  label={I18n.t('db_add_table_field_name')}
                  required
                  tips={
                    <div className={s['th-tip-name']}>
                      <span style={{ width: 494, marginBottom: 8 }}>
                        {I18n.t('db_add_table_field_name_tips')}
                      </span>
                      <Image
                        preview={false}
                        width={494}
                        height={163}
                        src={keyExample}
                      />
                    </div>
                  }
                />
              ),
              render: (text, record, index) =>
                record.operate !== 'add' ? (
                  <SLInput
                    style={{ position: 'static' }}
                    onRef={inputRef}
                    value={record.name}
                    inputProps={{
                      'data-testid': BotE2e.BotDatabaseAddModalFieldNameInput,
                      'data-dtestid': BotE2e.BotDatabaseAddModalFieldNameInput,
                      disabled: isReadonly || record.isSystemField,
                      placeholder: 'Enter Name',
                    }}
                    errorMsgFloat
                    onFocusPopoverProps={{
                      position: 'left',
                      content: <KeyTipsNode />,
                    }}
                    errorMsg={tableFieldsList[index]?.errorMapper?.name?.join(
                      '; ',
                    )}
                    handleChange={v => {
                      const newTableMemoryList = [...tableFieldsList];
                      newTableMemoryList[index].name = v;
                      setTableFieldsList(newTableMemoryList);
                      verifyTableFields('change');
                      resetContentCheckErrorMsg();
                    }}
                    handleBlur={() => {
                      verifyTableFields('blur');
                    }}
                  />
                ) : (
                  <div
                    ref={scrollRef}
                    data-testid={BotE2e.BotDatabaseAddModalAddBtn}
                  >
                    {isRowMaxLimit ? (
                      <div style={{ paddingRight: 10 }}>
                        <Tooltip
                          position="top"
                          content={I18n.t('bot_database_add_field', {
                            number: maxColumnNum,
                          })}
                        >
                          <Button
                            theme="light"
                            style={{ width: 240 }}
                            type="tertiary"
                            disabled
                            icon={<IconAdd />}
                          >
                            {I18n.t('bot_userProfile_add')}
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      <Button
                        style={{ width: 240 }}
                        theme="light"
                        type="tertiary"
                        disabled={isReadonly}
                        onClick={() => handleAdd(true)}
                        icon={<IconAdd />}
                      >
                        {I18n.t('bot_userProfile_add')}
                      </Button>
                    )}
                  </div>
                ),
              width: 246,
            },
            {
              dataIndex: 'desc',
              title: (
                <ColumnHeader
                  label={I18n.t('db_add_table_field_desc')}
                  required={false}
                  tips={
                    <article style={{ width: 327 }}>
                      {I18n.t('db_add_table_field_desc_tips')}
                    </article>
                  }
                />
              ),
              render: (text, record, index) =>
                record.operate !== 'add' ? (
                  <SLInput
                    value={record.desc}
                    maxCount={300}
                    inputProps={{
                      'data-testid': `${BotE2e.BotDatabaseAddModalFieldDescInput}.${index}.${record.name}`,
                      'data-dtestid': `${BotE2e.BotDatabaseAddModalFieldDescInput}.${index}.${record.name}`,
                      maxLength: 300,
                      disabled: isReadonly || record.isSystemField,
                      placeholder: I18n.t(
                        'bot_edit_variable_description_placeholder',
                      ),
                    }}
                    errorMsgFloat
                    handleChange={v => {
                      const newTableMemoryList = [...tableFieldsList];
                      newTableMemoryList[index].desc = v;
                      setTableFieldsList(newTableMemoryList);
                      resetContentCheckErrorMsg();
                    }}
                  />
                ) : null,
              width: 376,
            },
            {
              dataIndex: 'type',
              title: (
                <ColumnHeader
                  label={I18n.t('db_add_table_field_type')}
                  required={true}
                  tips={
                    <article style={{ width: 327 }}>
                      {I18n.t('db_add_table_field_type_tips')}
                    </article>
                  }
                />
              ),
              render: (text, record, index) =>
                record.operate !== 'add' ? (
                  <SLSelect
                    value={record.type}
                    selectProps={{
                      'data-testid': `${BotE2e.BotDatabaseAddModalFieldTypeSelect}.${index}.${record.name}`,
                      'data-dtestid': `${BotE2e.BotDatabaseAddModalFieldTypeSelect}.${index}.${record.name}`,
                      disabled:
                        isReadonly ||
                        (isModify && !!record.id) ||
                        record.isSystemField,
                      placeholder: I18n.t('db_table_save_exception_fieldtype'),
                      optionList: FIELD_TYPE_OPTIONS,
                    }}
                    errorMsgFloat
                    errorMsg={tableFieldsList[index]?.errorMapper?.type?.join(
                      '; ',
                    )}
                    handleChange={v => {
                      const newTableMemoryList = [...tableFieldsList];
                      newTableMemoryList[index].type = v as FieldItemType;
                      setTableFieldsList(newTableMemoryList);
                      verifyTableFields('change');
                    }}
                  />
                ) : null,
              width: 211,
            },
            {
              dataIndex: 'must_required',
              title: (
                <ColumnHeader
                  label={I18n.t('db_add_table_field_necessary')}
                  required={false}
                  tips={
                    <article style={{ width: 327 }}>
                      <p className={s['th-tip-dot']}>
                        {I18n.t('db_add_table_field_necessary_tips1')}
                      </p>
                      <p className={s['th-tip-dot']}>
                        {I18n.t('db_add_table_field_necessary_tips2')}
                      </p>
                    </article>
                  }
                />
              ),
              render: (text, record, index) =>
                record.operate !== 'add' ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Switch
                      data-testid={`${BotE2e.BotDatabaseAddModalFieldRequiredSwitch}.${index}.${record.name}`}
                      data-dtestid={`${BotE2e.BotDatabaseAddModalFieldRequiredSwitch}.${index}.${record.name}`}
                      style={{ margin: '4px 0 4px 12px' }}
                      disabled={
                        isReadonly ||
                        record.disableMustRequired ||
                        record.isSystemField
                      }
                      checked={record.must_required}
                      onChange={v => {
                        const newTableMemoryList = [...tableFieldsList];
                        newTableMemoryList[index].must_required = v;
                        setTableFieldsList(newTableMemoryList);
                      }}
                      aria-label="a switch for semi demo"
                    />
                  </div>
                ) : null,
              width: 108,
            },
            {
              dataIndex: 'operate',
              title: I18n.t('db_table_0126_021'),
              render: (text, record, index) =>
                record.operate !== 'add' ? (
                  <UITableAction
                    deleteProps={{
                      handleClick: () => {
                        if (isReadonly) {
                          return;
                        }

                        const newTableMemoryList = [
                          ...tableFieldsList.slice(0, index),
                          ...tableFieldsList.slice(index + 1),
                        ];

                        setTableFieldsList(newTableMemoryList);
                        verifyTableFields('change');
                        onDeleteField?.(newTableMemoryList);
                      },
                      popconfirm: {
                        defaultVisible: false,
                        visible: false,
                      },
                      tooltip: {
                        content: I18n.t('datasets_table_title_actions_delete'),
                      },
                      disabled: record.isSystemField,
                    }}
                    editProps={{
                      hide: true,
                    }}
                  />
                ) : null,
              width: 85,
            },
          ],
          dataSource,
          pagination: false,
          className: s['table-structure-table'],
          rowKey: 'nanoid',
        }}
        wrapperClassName={s['table-structure-table-wrapper']}
      />
      {isEmptyList ? (
        <div className={s['table-empty-tips']}>
          {I18n.t('db_table_save_exception_nofield')}
        </div>
      ) : null}
    </div>
  );
});
