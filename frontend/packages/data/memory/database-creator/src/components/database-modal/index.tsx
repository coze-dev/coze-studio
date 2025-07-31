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

/* eslint-disable complexity */
import { useRef, useMemo, useEffect, useState } from 'react';

import { nanoid } from 'nanoid';
import { useLocalStorageState } from 'ahooks';
import { IconAlertTriangle, IconClose } from '@douyinfe/semi-icons';
import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { BotE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n, getUnReactiveLanguage } from '@coze-arch/i18n';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import {
  Button,
  Image,
  Popconfirm,
  Divider,
  Icon,
  TextArea,
  Popover,
  UIButton,
  Modal,
  Form,
  Toast,
} from '@coze-arch/bot-semi';
import { IconWarningSize24 } from '@coze-arch/bot-icons';
import {
  BotTableRWMode,
  type RecommendDataModelResponse,
  SceneType,
  FieldItemType,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import {
  DatabaseTableStructure,
  type DatabaseTableStructureRef,
} from '../database-table-structure';
import { DatabaseCreateFromExcel } from '../database-create-from-excel';
import { BotDebugButton } from '../bot-debug-button';
import { CreateType, type OnSave, type NL2DBInfo } from '../../types';
import { useCreateFromExcelFG } from '../../hooks/use-create-from-excel-fg';
import { TEMPLATE_INFO } from '../../const';
import tableTempEN from '../../assets/table-template-en.png';
import tableTempCN from '../../assets/table-template-cn.png';
import tablePreviewEN from '../../assets/table-preview-en.png';
import tablePreviewCN from '../../assets/table-preview-cn.png';
import { ReactComponent as UpArrowSVG } from '../../assets/icon_up-arrow.svg';
import { ReactComponent as DownArrowSvg } from '../../assets/icon_down-arrow.svg';
import { ReactComponent as AddSVG } from '../../assets/icon_add_outlined.svg';
import { ReactComponent as GenerateSVG } from '../../assets/generate.svg';
import { ReactComponent as FileSVG } from '../../assets/file.svg';

import s from './index.module.less';

export interface ExpertModeConfig {
  isExpertMode: boolean;
  maxTableNum: number;
  maxColumnNum: number;
  readAndWriteModes: BotTableRWMode[];
}

export interface DatabaseModalProps {
  visible: boolean;
  onCancel: () => void;
  database: DatabaseInfo;
  botId: string;
  spaceId: string;
  readonly: boolean;
  NL2DBInfo: NL2DBInfo | null;
  expertModeConfig?: ExpertModeConfig;
  onSave?: OnSave;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = props => {
  const {
    database,
    botId,
    spaceId,
    readonly,
    onCancel,
    onSave,
    NL2DBInfo,
    expertModeConfig,
    visible,
  } = props;

  const [generateTableLoading, setGenerateTableLoading] = useState(false);
  const [contentCheckErrorMsg, setContentCheckErrorMsg] = useState<string>('');
  const [isEntry, setIsEntry] = useState<boolean>(
    !database.tableId && !NL2DBInfo,
  );
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isDeletedField, setIsDeletedField] = useState<boolean>(false);
  const [
    shouldHideDatabaseTableStructureTipsForCurrent,
    setShouldHideDatabaseTableStructureTipsForCurrent,
  ] = useState<boolean>(false);
  const [createType, setCreateType] = useState<CreateType>(
    NL2DBInfo ? CreateType.recommend : CreateType.custom,
  );
  const [data, setData] = useState<DatabaseInfo>({
    tableId: '',
    name: '',
    desc: '',
    readAndWriteMode: BotTableRWMode.LimitedReadWrite,
    tableMemoryList: [],
  });
  const [AIPopoverVisible, setAIPopoverVisible] = useState(false);

  const nlTextAreaRef = useRef<HTMLTextAreaElement>();
  const tableStructureRef = useRef<DatabaseTableStructureRef>();
  const enableCreateFromExcel = useCreateFromExcelFG();
  const [
    mapOfShouldHidingDatabaseTableStructureTips,
    setMapOfShouldHidingDatabaseTableStructureTips,
  ] = useLocalStorageState<string | undefined>(
    // FIXME: The meaning of this property name is unclear. For compatibility, this property name will not be modified for the time being, but a more explicit naming needs to be used in the future.
    'use-local-storage-state-modify-tips',
    {
      defaultValue: '',
    },
  );

  const language = getUnReactiveLanguage();
  const isEdit = Boolean(data.tableId);
  const [isReadonly, setIsReadonly] = useState(false);

  const handleSave = async () => {
    try {
      setIsReadonly(true);
      // @ts-expect-error -- linter-disable-autofix
      await tableStructureRef.current.submit();
    } finally {
      setIsReadonly(false);
    }
  };

  const hideTableStructureTips = useMemo(() => {
    const lsMap = JSON.parse(
      mapOfShouldHidingDatabaseTableStructureTips || '{}',
    );

    return (
      !isEdit ||
      lsMap?.[botId] ||
      shouldHideDatabaseTableStructureTipsForCurrent
    );
  }, [
    isEdit,
    shouldHideDatabaseTableStructureTipsForCurrent,
    mapOfShouldHidingDatabaseTableStructureTips,
  ]);

  const title = useMemo(() => {
    if (isEdit) {
      return I18n.t('db_edit_title');
    }
    if (createType === CreateType.excel) {
      return I18n.t('db_table_0126_011');
    }
    return I18n.t('db_add_table_title');
  }, [isEdit, createType]);

  const showEntry = isEntry && !isEdit && !NL2DBInfo;
  const shouldShowAIGenerate =
    /**
     * 1. The entrance is not displayed
     * 2. Editing status is not displayed
     * 3. Excel is not displayed when importing
     */
    !showEntry && !isEdit && createType !== CreateType.excel;

  const setDataToDefault = () => {
    setData({
      name: '',
      desc: '',
      tableId: '',
      readAndWriteMode: BotTableRWMode.LimitedReadWrite,
      tableMemoryList: [
        {
          nanoid: nanoid(),
          name: '',
          desc: '',
          type: FieldItemType.Text,
          must_required: false,
        },
      ],
    });
  };

  const setTableFieldsListToDefault = () => {
    tableStructureRef.current?.setTableFieldsList([
      {
        nanoid: nanoid(),
        name: '',
        desc: '',
        type: FieldItemType.Text,
        must_required: false,
      },
    ]);
  };

  const onUseTemplate = () => {
    setCreateType(CreateType.template);
    setIsEntry(false);
    setData({
      ...TEMPLATE_INFO,
    });
  };

  const onUseCustom = () => {
    setCreateType(CreateType.custom);
    setIsEntry(false);
    setDataToDefault();
  };

  const onUseExcel = () => {
    setCreateType(CreateType.excel);
    setIsEntry(false);
  };

  const generateTableByNL = async (text: string, type: SceneType) => {
    setGenerateTableLoading(true);
    let res: RecommendDataModelResponse | undefined;
    try {
      res = await MemoryApi.RecommendDataModel({
        bot_id: botId,
        scene_type: type,
        text,
      });
    } catch (error) {
      setGenerateTableLoading(false);
      dataReporter.errorEvent(DataNamespace.DATABASE, {
        eventName: REPORT_EVENTS.DatabaseNL2DB,
        error: error as Error,
      });
      setDataToDefault();
      setTableFieldsListToDefault();
    }

    if (res?.bot_table_list?.[0]) {
      if (type === SceneType.BotPersona) {
        setCreateType(CreateType.recommend);
      }
      if (type === SceneType.ModelDesc) {
        setCreateType(CreateType.naturalLanguage);
      }
      setData({
        tableId: '',
        // @ts-expect-error -- linter-disable-autofix
        name: res.bot_table_list[0].table_name,
        // @ts-expect-error -- linter-disable-autofix
        desc: res.bot_table_list[0].table_desc,
        readAndWriteMode: BotTableRWMode.LimitedReadWrite,
        // @ts-expect-error -- linter-disable-autofix
        tableMemoryList: res.bot_table_list[0].field_list.map(i => ({
          name: i.name,
          desc: i.desc,
          must_required: i.must_required,
          type: i.type,
          nanoid: nanoid(),
          id: Number(i.id),
        })),
      });

      // Data is the initial value, where you need to manually setState to update the subcomponent state
      // If Modal has been closed early and the subassembly is uninstalled, the ref is empty. You need to add an optional chain to judge.
      tableStructureRef.current?.setTableFieldsList(
        // @ts-expect-error -- linter-disable-autofix
        res.bot_table_list[0].field_list.map(i => ({
          name: i.name,
          desc: i.desc,
          must_required: i.must_required,
          type: i.type,
          nanoid: nanoid(),
          id: Number(i.id),
        })),
      );
    } else {
      if (type === SceneType.BotPersona) {
        Toast.info(I18n.t('recommended_failed'));
        setDataToDefault();
        setTableFieldsListToDefault();
      }
      if (type === SceneType.ModelDesc) {
        Toast.warning(I18n.t('generate_failed'));
        setAIPopoverVisible(true);
      }
    }
    setGenerateTableLoading(false);
  };

  const handleGenerate = () => {
    const generate = () => {
      const { value } = nlTextAreaRef.current || {};
      if (value) {
        generateTableByNL(value, SceneType.ModelDesc);
      }
    };

    sendTeaEvent(EVENT_NAMES.generate_with_ai_click, {
      bot_id: botId,
      need_login: true,
      have_access: true,
    });
    setAIPopoverVisible(false);

    if (
      // @ts-expect-error -- linter-disable-autofix
      tableStructureRef.current.tableFieldsList.filter(i => i.name).length > 0
    ) {
      Modal.warning({
        title: I18n.t('bot_database_ai_replace'),
        content: I18n.t('bot_database_ai_replace_detailed'),
        okButtonProps: {
          type: 'warning',
        },
        onOk: () => {
          generate();
        },
        maskClosable: false,
        icon: <IconWarningSize24 />,
      });
    } else {
      generate();
    }
  };

  useEffect(() => {
    setAIPopoverVisible(false);
    setIsPreview(false);
    setShouldHideDatabaseTableStructureTipsForCurrent(false);
    setIsDeletedField(false);
    setContentCheckErrorMsg('');
    setIsEntry(true);
  }, [visible]);

  useEffect(() => {
    setData(database);
  }, [database]);

  useEffect(() => {
    setCreateType(NL2DBInfo ? CreateType.recommend : CreateType.custom);
  }, [NL2DBInfo]);

  useEffect(() => {
    if (NL2DBInfo && visible) {
      generateTableByNL(NL2DBInfo.prompt, SceneType.BotPersona);
    }
  }, [NL2DBInfo, visible]);

  const DefaultFooter = (
    <>
      {contentCheckErrorMsg ? (
        <Form.ErrorMessage error={contentCheckErrorMsg} />
      ) : null}
      {hideTableStructureTips ? null : (
        <div className={s['modal-modify-tips']}>
          <div className={s.description}>
            <IconAlertTriangle className={s['tip-icon']} />
            <span style={{ textAlign: 'left' }}>{I18n.t('db_edit_tips1')}</span>
            <span
              className={s.link}
              onClick={() => {
                const lsMap = JSON.parse(
                  mapOfShouldHidingDatabaseTableStructureTips || '{}',
                );
                lsMap[botId] = true;
                setMapOfShouldHidingDatabaseTableStructureTips(
                  JSON.stringify(lsMap),
                );
              }}
            >
              {I18n.t('db_edit_tips2')}
            </span>
          </div>

          <IconClose
            onClick={() =>
              setShouldHideDatabaseTableStructureTipsForCurrent(true)
            }
            style={{ cursor: 'pointer' }}
          />
        </div>
      )}
      <div className={s['modal-table-btn']}>
        {isDeletedField ? (
          <Popconfirm
            title={I18n.t('db_del_field_confirm_title')}
            content={I18n.t('db_del_field_confirm_info')}
            okText={I18n.t('db_del_field_confirm_yes')}
            cancelText={I18n.t('db_del_field_confirm_no')}
            okType="danger"
            onConfirm={handleSave}
          >
            <BotDebugButton
              loading={isReadonly}
              theme="solid"
              type="primary"
              readonly={readonly}
            >
              {I18n.t('db_edit_save')}
            </BotDebugButton>
          </Popconfirm>
        ) : (
          <BotDebugButton
            readonly={readonly}
            loading={isReadonly}
            theme="solid"
            type="primary"
            onClick={handleSave}
          >
            {I18n.t('db_edit_save')}
          </BotDebugButton>
        )}
      </div>
    </>
  );

  const Entry = (
    <div className={s['modal-temp']}>
      <div className={s.entry}>
        <div
          className={s['entry-method']}
          onClick={onUseCustom}
          data-testid={BotE2e.BotDatabaseAddModalAddCustomBtn}
        >
          <Icon svg={<AddSVG />} className={s['entry-method-icon']} />
          <span className={s['entry-method-title']}>
            {I18n.t('db_add_table_cust')}
          </span>
        </div>

        {enableCreateFromExcel ? (
          <Divider
            layout="vertical"
            style={{
              height: '32px',
            }}
          />
        ) : null}
        {enableCreateFromExcel ? (
          <div className={s['entry-method']} onClick={onUseExcel}>
            <Icon svg={<FileSVG />} className={s['entry-method-icon']} />
            <span className={s['entry-method-title']}>
              {I18n.t('db_table_0126_010')}
            </span>
          </div>
        ) : null}
      </div>
      <div className={s['modal-temp-right']}>
        <div
          className={s['modal-temp-title']}
          data-testid={BotE2e.BotDatabaseAddModalTemplateTitle}
        >
          {I18n.t('db_add_table_temp_title')}
        </div>
        <Image
          className={s['modal-temp-image']}
          height={201}
          src={language === 'zh-CN' ? tableTempCN : tableTempEN}
        />
        <div className={s['modal-temp-description']}>
          💡{I18n.t('db_add_table_temp_tips')}
        </div>
        {isPreview ? (
          <div className={s['modal-temp-preview']}>
            <div className={s.title}>
              {I18n.t('db_add_table_temp_preview_tips')}
            </div>
            <Image
              height={239}
              src={language === 'zh-CN' ? tablePreviewCN : tablePreviewEN}
            />
          </div>
        ) : null}
        <div className={s['modal-temp-btn-group']}>
          <Button
            data-testid={BotE2e.BotDatabaseAddModalPreviewTemplateBtn}
            theme="light"
            type="tertiary"
            onClick={() => setIsPreview(state => !state)}
            className={s['modal-temp-btn']}
          >
            {I18n.t('db_add_table_temp_preview')}
          </Button>
          <Button
            data-testid={BotE2e.BotDatabaseAddModalUseTemplateBtn}
            theme="solid"
            type="primary"
            onClick={onUseTemplate}
            className={s['modal-temp-btn']}
          >
            {I18n.t('db_add_table_temp_use')}
          </Button>
        </div>
      </div>
    </div>
  );

  const getFooter = () => {
    if (showEntry) {
      return null;
    }
    if (createType === CreateType.excel) {
      return null;
    }
    return DefaultFooter;
  };

  const getContent = () => {
    if (showEntry) {
      return Entry;
    }
    if (createType === CreateType.excel) {
      return (
        <DatabaseCreateFromExcel
          onCancel={onCancel}
          botId={botId}
          onSave={onSave}
          spaceId={spaceId}
          // @ts-expect-error -- linter-disable-autofix
          maxColumnNum={expertModeConfig.maxColumnNum}
        />
      );
    }

    return (
      <div className={s['database-table-structure-container']}>
        <DatabaseTableStructure
          data={data}
          // @ts-expect-error -- linter-disable-autofix
          ref={tableStructureRef}
          loading={generateTableLoading}
          loadingTips={I18n.t('bot_database_ai_waiting')}
          botId={botId}
          readAndWriteModeOptions={
            // @ts-expect-error -- linter-disable-autofix
            expertModeConfig.isExpertMode ? 'expert' : 'normal'
          }
          // @ts-expect-error -- linter-disable-autofix
          maxColumnNum={expertModeConfig.maxColumnNum}
          onSave={onSave}
          onCancel={onCancel}
          onDeleteField={list => {
            setIsDeletedField(
              !database.tableMemoryList.every(i =>
                // TODO: There is a problem with the current field id generation rule, so the nanoid is temporarily replaced
                list.find(j => j.nanoid === i.nanoid),
              ),
            );
          }}
          createType={createType}
          setContentCheckErrorMsg={setContentCheckErrorMsg}
        />
      </div>
    );
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      closable={false}
      width={1138}
      centered
      footer={getFooter()}
      title={
        <div className={s['title-wrapper']}>
          <div data-testid={BotE2e.BotDatabaseAddModalTitle}>{title}</div>
          <div className={s.right}>
            {shouldShowAIGenerate ? (
              <Popover
                trigger="custom"
                position="bottomRight"
                content={
                  <div className={s['generate-ai-popover-wrapper']}>
                    <div
                      className={s.title}
                      data-testid={
                        BotE2e.BotDatabaseAddModalTitleCreateAiModalTitle
                      }
                    >
                      {I18n.t('bot_database_ai_create')}
                    </div>
                    <TextArea
                      data-testid={
                        BotE2e.BotDatabaseAddModalTitleCreateAiModalDesc
                      }
                      autosize
                      // @ts-expect-error -- linter-disable-autofix
                      ref={nlTextAreaRef}
                      rows={1}
                      placeholder={I18n.t('bot_database_ai_create_tip')}
                      className={s['text-area']}
                    />
                    <div className={s['button-wrapper']}>
                      <UIButton
                        data-testid={
                          BotE2e.BotDatabaseAddModalTitleCreateAiModalCreateBtn
                        }
                        theme="borderless"
                        onClick={handleGenerate}
                        icon={<Icon svg={<GenerateSVG />} />}
                      >
                        {I18n.t('bot_database_ai_generate')}
                      </UIButton>
                    </div>
                  </div>
                }
                keepDOM
                visible={AIPopoverVisible}
                onVisibleChange={_v => {
                  setAIPopoverVisible(_v);
                }}
                onClickOutSide={() => {
                  setAIPopoverVisible(false);
                }}
                className={s.popover}
              >
                <UIButton
                  data-testid={BotE2e.BotDatabaseAddModalTitleCreateAiBtn}
                  theme="borderless"
                  icon={
                    AIPopoverVisible ? (
                      <Icon svg={<UpArrowSVG />} />
                    ) : (
                      <Icon svg={<DownArrowSvg />} />
                    )
                  }
                  iconPosition="right"
                  onClick={() => {
                    sendTeaEvent(EVENT_NAMES.nl2table_create_table_click, {
                      bot_id: botId,
                      need_login: true,
                      have_access: true,
                    });
                    setAIPopoverVisible(true);
                  }}
                >
                  {I18n.t('bot_database_ai_create')}
                </UIButton>
              </Popover>
            ) : null}
            <UIButton
              data-testid={BotE2e.BotDatabaseAddModalTitleCloseIcon}
              icon={<IconClose />}
              type="tertiary"
              theme="borderless"
              onClick={onCancel}
              className={s['modal-close-button']}
            />
          </div>
        </div>
      }
      maskClosable={false}
    >
      <div className={s['modal-container']}>{getContent()}</div>
    </Modal>
  );
};
