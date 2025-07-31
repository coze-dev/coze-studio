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

/* eslint-disable @coze-arch/max-line-per-function */
import { useNavigate, useParams } from 'react-router-dom';
import React, { type FC, useEffect, useRef, useState, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import copy from 'copy-to-clipboard';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { FilterKnowledgeType } from '@coze-data/utils';
import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { RagModeConfiguration } from '@coze-data/knowledge-modal-base';
import { useKnowledgeListModal } from '@coze-data/knowledge-modal-adapter';
import { ActionType } from '@coze-data/knowledge-ide-base/types';
import { useDatasetStore } from '@coze-data/knowledge-data-set-for-agent';
import { BotE2e } from '@coze-data/e2e';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy, IconCozMinusCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Popover } from '@coze-arch/coze-design';
import { OpenBlockEvent, emitEvent } from '@coze-arch/bot-utils';
import { useSpaceStore } from '@coze-arch/bot-studio-store';
import { UIButton, UITag, Toast } from '@coze-arch/bot-semi';
import { IconRobot, IconStyleSet, IconDownArrow } from '@coze-arch/bot-icons';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { CustomError } from '@coze-arch/bot-error';
import { DatasetSource, FormatType } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
  ToolItemList,
  ToolItem,
  ToolItemAction,
  AddButton,
} from '@coze-agent-ide/tool';
import { useBotEditor } from '@coze-agent-ide/bot-editor-context-store';

import { usePopoverLock } from '../../hook/use-popover-lock';
import { useDatasetAutoChangeConfirm } from '../../hook/use-dataset-auto-change-confirm';

import s from './index.module.less';

const E2E_NAME_MAP = {
  [FormatType.Image]: 'image',
  [FormatType.Table]: 'table',
  [FormatType.Text]: 'text',
};

export const Setting: React.FC<{ modelId: string }> = ({ modelId }) => {
  const { knowledge, updateSkillKnowledgeDatasetInfo } = useBotSkillStore(
    useShallow(state => ({
      knowledge: state.knowledge,
      updateSkillKnowledgeDatasetInfo: state.updateSkillKnowledgeDatasetInfo,
    })),
  );
  const isReadonly = useBotDetailIsReadonly();

  const { props, setLocked, visible, setVisible } = usePopoverLock();

  const confirm = useDatasetAutoChangeConfirm();
  const hasTableDataSet = useDatasetStore(state =>
    state.dataSetList.some(dataSet => dataSet.format_type === FormatType.Table),
  );
  return (
    <Popover
      className={s['setting-content-popover']}
      content={
        <RagModeConfiguration
          showNL2SQLConfig={hasTableDataSet}
          dataSetInfo={knowledge.dataSetInfo}
          onDataSetInfoChange={async newVal => {
            const { auto } = newVal;
            // Pre-check when modifying the invocation mode
            if (auto !== knowledge.dataSetInfo.auto) {
              try {
                setLocked(true);
                const res = await confirm(auto, modelId);
                if (res) {
                  updateSkillKnowledgeDatasetInfo(newVal);
                }
              } finally {
                setLocked(false);
              }
            } else {
              updateSkillKnowledgeDatasetInfo(newVal);
            }
          }}
          isReadonly={isReadonly}
        />
      }
      position="bottomLeft"
      trigger="click"
      zIndex={1031}
      {...props}
    >
      <UIButton
        data-testid={BotE2e.BotKnowledgeAutoMaticBtn}
        theme="borderless"
        size="small"
        icon={knowledge.dataSetInfo.auto ? <IconRobot /> : <IconStyleSet />}
        className={s['setting-trigger']}
        onClick={() => {
          setVisible(!visible);
        }}
      >
        {knowledge.dataSetInfo.auto
          ? I18n.t('dataset_automatic_call')
          : I18n.t('dataset_on_demand_call')}
        <IconDownArrow className={s['setting-trigger-icon']} />
      </UIButton>
    </Popover>
  );
};

type IDataSetAreaProps = ToolEntryCommonProps & {
  formatType?: FormatType;
  tooltip?: string;
  initRef: React.MutableRefObject<boolean>;
  desc?: string;
};

const renderTableToolNode = (title: string) => (
  <div className={s['tip-content']}>{title}</div>
);

export const DataSetAreaItem: FC<IDataSetAreaProps> = ({
  title,
  desc,
  formatType,
  initRef,
  tooltip,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const dataSetList = useDatasetStore(state => state.dataSetList);
  const setDataSetList = useDatasetStore(state => state.setDataSetList);
  const setToolValidData = useToolValidData();
  const defaultKnowledgeType = useMemo(() => {
    switch (formatType) {
      case FormatType.Table:
        return FilterKnowledgeType.TABLE;
      case FormatType.Text:
        return FilterKnowledgeType.TEXT;
      case FormatType.Image:
        return FilterKnowledgeType.IMAGE;
      default:
        return undefined;
    }
  }, [formatType]);

  const { knowledge, updateSkillKnowledgeDatasetList } = useBotSkillStore(
    useShallow(state => ({
      knowledge: state.knowledge,
      updateSkillKnowledgeDatasetList: state.updateSkillKnowledgeDatasetList,
    })),
  );

  const isReadonly = useBotDetailIsReadonly();
  const jumpToDetail = (datasetID: string) => {
    const actionType = dataSetList.find(
      dataset => dataset.dataset_id === datasetID,
    )
      ? ActionType.REMOVE
      : ActionType.ADD;

    const queryParams = {
      biz: 'agentIDE',
      bot_id: params.bot_id,
      page_mode: 'modal',
      action_type: actionType,
    };

    navigate(
      `/space/${params.space_id}/knowledge/${datasetID}?${new URLSearchParams(
        queryParams,
      ).toString()}`,
    );
  };
  const jumpToAdd = (datasetID: string, type: UnitType) => {
    const queryParams = {
      biz: 'agentIDE',
      type,
      bot_id: params.bot_id,
      action_type: ActionType.ADD,
      page_mode: 'modal',
    };
    navigate(
      `/space/${
        params.space_id
      }/knowledge/${datasetID}/upload?${new URLSearchParams(
        queryParams,
      ).toString()}`,
    );
  };
  const { node: addModal, open: openAddModal } = useKnowledgeListModal({
    datasetList: dataSetList,
    defaultType: defaultKnowledgeType,
    onDatasetListChange: list => {
      emitEvent(OpenBlockEvent.DATA_SET_BLOCK_OPEN);
      setDataSetList(list);
    },
    onClickAddKnowledge: jumpToAdd,
    onClickKnowledgeDetail: jumpToDetail,
  });

  useEffect(() => {
    // Exclude first initialization and deletion of updates for:
    // Because deletion is quick, useEffect traces that the data may be the final result, and there is no guarantee that every deletion will be monitored
    if (initRef.current && removedIds.length === 0) {
      updateSkillKnowledgeDatasetList(
        dataSetList.map(d => ({
          dataset_id: d.dataset_id ?? '',
          name: d.name,
        })),
      );
    }
  }, [dataSetList]);

  useEffect(() => {
    if (removedIds.length > 0) {
      const updatedDataSetList = dataSetList.filter(
        d => !removedIds.includes(d?.dataset_id ?? ''),
      );

      const updateParam = updatedDataSetList.map(d => ({
        dataset_id: d.dataset_id ?? '',
        name: d.name,
      }));

      updateSkillKnowledgeDatasetList(updateParam);
      setRemovedIds([]);
    }
  }, [removedIds]);

  const onCopy = (text: string) => {
    const res = copy(text);
    if (!res) {
      throw new CustomError(ReportEventNames.parmasValidation, 'empty copy');
    }
    Toast.success({
      content: I18n.t('copy_success'),
      showClose: false,
      id: 'dataset_copy_id',
    });
  };

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.DATA_SET_BLOCK,
    configured: knowledge.dataSetList.length > 0,
  });

  const currentDatasetList = useMemo(
    () =>
      dataSetList.filter(
        item => formatType === undefined || item.format_type === formatType,
      ),
    [dataSetList],
  );

  useEffect(() => {
    setToolValidData(Boolean(currentDatasetList.length));
  }, [currentDatasetList.length]);

  return (
    <>
      {addModal}
      <ToolContentBlock
        className={s['data-set-container']}
        blockEventName={OpenBlockEvent.DATA_SET_BLOCK_OPEN}
        header={title}
        setting={null}
        tooltipType={tooltip ? 'tooltip' : undefined}
        tooltip={tooltip ? renderTableToolNode(tooltip) : null}
        defaultExpand={defaultExpand}
        actionButton={
          <AddButton
            tooltips={I18n.t('bot_edit_dataset_add_tooltip')}
            onClick={openAddModal}
            enableAutoHidden={true}
            data-testid={`bot.editor.tool.data-set-${
              E2E_NAME_MAP[formatType as keyof typeof E2E_NAME_MAP]
            }.add-button`}
          />
        }
      >
        <div className={s['data-set-content']}>
          {currentDatasetList.length ? (
            <>
              {currentDatasetList.length && !knowledge.dataSetInfo.auto ? (
                <div className={s['dataset-setting-tip']}>
                  {I18n.t('bot_edit_dataset_on_demand_prompt1')}
                  <Tooltip content={I18n.t('bot_edit_datasets_copyName')}>
                    <UITag
                      onClick={() =>
                        onCopy(I18n.t('dataset_recall_copy_value'))
                      }
                      type="light"
                      className={s['copy-trigger']}
                    >
                      <IconCozCopy className={s['icon-copy']} />
                      {I18n.t('dataset_recall_copy_label')}
                    </UITag>
                  </Tooltip>
                  {I18n.t('bot_edit_dataset_on_demand_prompt2')}
                </div>
              ) : null}
              <ToolItemList>
                {currentDatasetList.map((item, index) => (
                  <ToolItem
                    key={item.dataset_id}
                    title={item?.name ?? ''}
                    description={item?.description ?? ''}
                    avatar={item?.icon_url ?? ''}
                    onClick={() =>
                      item?.dataset_id && jumpToDetail(item?.dataset_id)
                    }
                    actions={
                      <>
                        {!isReadonly && (
                          <ToolItemAction
                            tooltips={I18n.t('Copy_name')}
                            onClick={() => onCopy(item?.name ?? '')}
                            data-testid="bot.editor.tool.plugin.copy-button"
                          >
                            <IconCozCopy className="text-sm coz-fg-secondary" />
                          </ToolItemAction>
                        )}

                        {!isReadonly && (
                          <ToolItemAction
                            tooltips={I18n.t('remove_dataset')}
                            onClick={() => {
                              setDataSetList(
                                dataSetList.filter(
                                  d => d.dataset_id !== item.dataset_id,
                                ),
                              );
                              if (item?.dataset_id) {
                                setRemovedIds([
                                  ...removedIds,
                                  item?.dataset_id,
                                ]);
                              }
                            }}
                          >
                            <IconCozMinusCircle className="text-sm coz-fg-secondary" />
                          </ToolItemAction>
                        )}
                      </>
                    }
                  />
                ))}
              </ToolItemList>
            </>
          ) : (
            <div className={s['default-text']}>
              {desc ?? I18n.t('bot_edit_dataset_explain')}
            </div>
          )}
        </div>
      </ToolContentBlock>
    </>
  );
};

export const useDataSetArea = () => {
  const spaceId = useSpaceStore(v => v.space.id);
  const {
    storeSet: { useDraftBotDataSetStore },
  } = useBotEditor();

  const initRef = useRef(false);
  const setDataSetList = useDatasetStore(state => state.setDataSetList);
  const { knowledge } = useBotSkillStore(
    useShallow(state => ({
      knowledge: state.knowledge,
    })),
  );
  const { pageFrom, init } = usePageRuntimeStore(
    useShallow(state => ({
      pageFrom: state.pageFrom,
      init: state.init,
    })),
  );
  const getDataSetList = async () => {
    if (knowledge.dataSetList.length) {
      const resp = await KnowledgeApi.ListDataset({
        space_id: spaceId,
        filter: {
          dataset_ids: knowledge.dataSetList.map(i => i.dataset_id ?? ''),
          source_type:
            pageFrom === 'explore' ? DatasetSource.SourceExplore : undefined,
        },
      });
      const validDatasetList = (resp?.dataset_list ?? []).filter(item =>
        knowledge.dataSetList.some(i => i.dataset_id === item.dataset_id),
      );
      // Easy data reuse
      useDraftBotDataSetStore.getState().batchUpdate(validDatasetList);
      setDataSetList(validDatasetList);
    }
    initRef.current = true;
  };

  useEffect(() => {
    if (init) {
      getDataSetList();
    }
  }, [init]);
  useEffect(
    () => () => {
      setDataSetList([]);
    },
    [],
  );

  return {
    node: DataSetAreaItem,
    initRef,
  };
};
