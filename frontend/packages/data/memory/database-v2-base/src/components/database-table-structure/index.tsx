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
import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  type MutableRefObject,
  useEffect,
  type ReactNode,
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
import { Button, Switch, Form } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  UITable,
  UITableAction,
  Tooltip,
  Image,
  Banner,
} from '@coze-arch/bot-semi';
import { IconAdd } from '@coze-arch/bot-icons';
import { isApiError } from '@coze-arch/bot-http';
import {
  type UpdateDatabaseRequest,
  type AddDatabaseRequest,
  BotTableRWMode,
  type FieldItemType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { SLSelect } from '../singleline-select';
import { FormSLInput, SLInput } from '../singleline-input';
import { DatabaseFieldTitle } from '../database-field-title';
import {
  type TriggerType,
  type TableFieldsInfo,
  type TableBasicInfo,
  type ReadAndWriteModeOptions,
  type CreateType,
  type OnSave,
} from '../../types/database-field';
import {
  DATABASE_CONTENT_CHECK_ERROR_CODE,
  DATABASE_CONTENT_CHECK_ERROR_CODE_NEW,
  FIELD_TYPE_OPTIONS,
  RW_MODE_OPTIONS_MAP,
  SYSTEM_FIELDS,
} from '../../constants/database-field';
import keyExample from '../../assets/key-example.png';
import { validateFields, validateNaming } from './helpers/validate';
import { KeyTipsNode } from './components/KeyTipsNode';

import s from './index.module.less';

const MAX_COLUMNS = 20;

export interface DatabaseTableStructureProps {
  data: DatabaseInfo;
  botId?: string;
  spaceId?: string;
  creatorId?: string;
  forceEdit?: boolean;
  loading?: boolean;
  loadingTips?: string;
  projectID?: string;
  /**
   * Excel: single user mode | read-only mode
   * Normal: Single user mode | Read-only mode
   * Expert: Single user mode | Read-only mode | Multi-user mode
   * Undefined: Read and write modes are not supported
   */
  readAndWriteModeOptions?: ReadAndWriteModeOptions;
  /** Only display Mode UI in DatabaseInfo */
  onlyShowDatabaseInfoRWMode?: boolean;
  enableAdd?: boolean;
  isReadonlyMode?: boolean;
  maxColumnNum?: number;
  /**
   * Whether to display basic information (table name, introduction)
   */
  showDatabaseBaseInfo?: boolean;
  hiddenTableBorder?: boolean;

  useComputingEnableGoToNextStep?: (
    list: TableFieldsInfo,
    isEmptyList: boolean,
  ) => void;
  onCancel?: () => void;
  onSave?: OnSave;
  onDeleteField?: (list: TableFieldsInfo) => void;
  setContentCheckErrorMsg?: (s: string) => void;

  createType: CreateType;

  renderModeSelect?: (props: {
    dataTestId: string;
    field: string;
    label: string;
    type: 'select';
    options: BotTableRWMode[];
  }) => ReactNode;
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
  // eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function, complexity -- historical file copy
>((props, ref) => {
  const {
    data: initialData,
    botId = '',
    spaceId = '',
    creatorId = '',
    onSave,
    onCancel,
    onDeleteField,
    forceEdit = false,
    maxColumnNum = MAX_COLUMNS,
    useComputingEnableGoToNextStep,
    readAndWriteModeOptions,
    onlyShowDatabaseInfoRWMode,
    enableAdd = true,
    loading = false,
    setContentCheckErrorMsg = noop,
    // TODO put AI generated loading tips into the table
    // loadingTips,
    createType,
    showDatabaseBaseInfo,
    hiddenTableBorder,
    isReadonlyMode,
    projectID,
    renderModeSelect,
  } = props;
  const [tableFieldsList, setTableFieldsList] = useState<TableFieldsInfo>([]);

  const inputRef = useRef<{
    triggerFocus?: () => void;
  }>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableBasicInfoFormRef = useRef<Form<TableBasicInfo>>();

  const isModify = Boolean(initialData.tableId);

  const [isReadonly, { setTrue: enableReadonly, setFalse: disableReadonly }] =
    useBoolean(false);
  // System fields do not count towards the number of fields limit
  const userFields = tableFieldsList.filter(i => !i.isSystemField);
  const isRowMaxLimit = userFields.length >= maxColumnNum;
  const isExceedRowMaxLimit = userFields.length > maxColumnNum;
  const isEmptyList =
    userFields.filter(i => i.name || i.desc || i.type).length <= 0;
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
    if (showDatabaseBaseInfo) {
      try {
        // @ts-expect-error -- linter-disable-autofix
        await tableBasicInfoFormRef.current.formApi.validate(['name']);
      } catch (error) {
        return false;
      }
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
    let tableBasicInfo: TableBasicInfo = {};
    if (tableBasicInfoFormRef.current) {
      tableBasicInfo = tableBasicInfoFormRef.current.formApi.getValues();
    } else {
      tableBasicInfo = {
        name: initialData.name,
        desc: initialData.desc,
        readAndWriteMode: initialData.readAndWriteMode,
        prompt_disabled: initialData.extra_info?.prompt_disabled === 'true',
      };
    }
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
    const params: AddDatabaseRequest | UpdateDatabaseRequest = {
      table_name: onlyShowDatabaseInfoRWMode
        ? initialData.name
        : tableBasicInfo.name,
      table_desc: onlyShowDatabaseInfoRWMode
        ? initialData.desc
        : tableBasicInfo.desc,
      icon_uri: initialData.icon_uri,
      prompt_disabled: !!tableBasicInfo.prompt_disabled,
      field_list: tableFieldsList
        .filter(i => !!i.name && !i.isSystemField)
        .map(i => ({
          name: i.name,
          desc: i.desc || '',
          type: i.type,
          must_required: i.must_required,
          id: i?.id,
          alterId: i?.alterId,
        })),
      rw_mode: tableBasicInfo.readAndWriteMode,
    };
    if (!isModify) {
      try {
        resp = await MemoryApi.AddDatabase({
          ...params,
          space_id: spaceId,
          creator_id: creatorId,
          project_id: projectID,
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
        resp = await MemoryApi.UpdateDatabase({
          ...params,
          id: initialData.tableId,
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
    return '';
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

  // Verify that the Next button is disabled
  useComputingEnableGoToNextStep?.(tableFieldsList, isEmptyList);

  const dataSource = enableAdd
    ? [...tableFieldsList, { operate: 'add' }]
    : tableFieldsList;

  const resetContentCheckErrorMsg = () => {
    setContentCheckErrorMsg('');
  };

  useEffect(() => {
    setTableFieldsList([...SYSTEM_FIELDS, ...initialData.tableMemoryList]);
    if (tableBasicInfoFormRef.current && !loading) {
      tableBasicInfoFormRef.current.formApi.setValues({
        name: initialData?.name || '',
        desc: initialData?.desc || '',
        prompt_disabled: isModify
          ? initialData.extra_info?.prompt_disabled === 'true'
          : false,
        readAndWriteMode:
          initialData?.readAndWriteMode || BotTableRWMode.LimitedReadWrite,
      });
    }
  }, [initialData, loading]);

  return (
    <div
      className={classNames(s['table-structure-wrapper'], {
        [s['hidden-form-border']]: hiddenTableBorder,
      })}
    >
      {showDatabaseBaseInfo ? (
        <Form<TableBasicInfo>
          // @ts-expect-error -- linter-disable-autofix
          ref={tableBasicInfoFormRef}
          layout="vertical"
          className={s['table-structure-form']}
          onValueChange={(_values, changedV) => {
            if ('name' in changedV || 'desc' in changedV) {
              resetContentCheckErrorMsg();
            }
          }}
        >
          {onlyShowDatabaseInfoRWMode ? null : (
            <>
              <FormSLInput
                field="name"
                label={{
                  text: I18n.t('db_add_table_name'),
                  required: true,
                }}
                validate={v => getTableNameErrorMessage(v)}
                trigger={['change', 'blur']}
                fieldClassName={s['table-name-form-field']}
                disabled={isReadonlyMode}
                inputProps={{
                  'data-testid': BotE2e.BotDatabaseAddModalTableNameInput,
                  disabled: !forceEdit && (isReadonly || isModify),
                  placeholder: I18n.t('db_add_table_name_tips'),
                }}
                onFocusPopoverProps={{
                  style: { padding: '2px 12px' },
                  position: 'left',
                  content: <KeyTipsNode />,
                }}
              />
              <Form.TextArea
                data-testid={BotE2e.BotDatabaseAddModalTableDescInput}
                field="desc"
                label={I18n.t('db_add_table_desc')}
                disabled={isReadonly || isReadonlyMode}
                rows={2}
                placeholder={I18n.t('db_add_table_desc_tips')}
                fieldClassName={s['table-desc-form-field']}
              />
            </>
          )}
          {renderModeSelect && readAndWriteModeOptions
            ? renderModeSelect({
                dataTestId: BotE2e.BotDatabaseAddModalTableQueryModeSelect,
                field: 'readAndWriteMode',
                label: I18n.t('db_table_0129_001'),
                type: 'select',
                options: RW_MODE_OPTIONS_MAP[readAndWriteModeOptions],
              })
            : null}
        </Form>
      ) : null}

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
          loading,
          columns: [
            {
              dataIndex: 'name',
              title: (
                <DatabaseFieldTitle
                  field={I18n.t('db_add_table_field_name')}
                  required
                  tip={
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
                      disabled:
                        isReadonly || record.isSystemField || isReadonlyMode,
                      placeholder: 'Enter Name',
                    }}
                    errorMsgFloat
                    onFocusPopoverProps={{
                      style: { padding: '2px 12px' },
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
                          <Button color="secondary" disabled icon={<IconAdd />}>
                            {I18n.t('bot_userProfile_add')}
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      <Button
                        color="primary"
                        disabled={isReadonly}
                        onClick={() => handleAdd(true)}
                        icon={<IconAdd />}
                      >
                        {I18n.t('bot_userProfile_add')}
                      </Button>
                    )}
                  </div>
                ),
              width: 261,
            },
            {
              dataIndex: 'desc',
              title: (
                <DatabaseFieldTitle
                  field={I18n.t('db_add_table_field_desc')}
                  tip={
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
                      disabled:
                        isReadonly || record.isSystemField || isReadonlyMode,
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
              width: 369,
            },
            {
              dataIndex: 'type',
              title: (
                <DatabaseFieldTitle
                  field={I18n.t('db_add_table_field_type')}
                  required
                  tip={
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
                        record.isSystemField ||
                        isReadonlyMode,
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
              width: 214,
            },
            {
              dataIndex: 'must_required',
              title: (
                <DatabaseFieldTitle
                  field={I18n.t('db_add_table_field_necessary')}
                  tip={
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
                      disabled={
                        isReadonly ||
                        record.disableMustRequired ||
                        record.isSystemField ||
                        isReadonlyMode
                      }
                      checked={record.must_required}
                      onChange={v => {
                        const newTableMemoryList = [...tableFieldsList];
                        newTableMemoryList[index].must_required = v;
                        setTableFieldsList(newTableMemoryList);
                      }}
                      size="small"
                      aria-label="a switch for semi demo"
                    />
                  </div>
                ) : null,
              width: 108,
            },
            {
              dataIndex: 'operate',
              title: <DatabaseFieldTitle field={I18n.t('db_table_0126_021')} />,
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
                      disabled: record.isSystemField || isReadonlyMode,
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
      {/* Error message at the bottom when the table is empty */}
      {isEmptyList && !loading ? (
        <div className={s['table-empty-tips']}>
          {I18n.t('db_table_save_exception_nofield')}
        </div>
      ) : null}
    </div>
  );
});
