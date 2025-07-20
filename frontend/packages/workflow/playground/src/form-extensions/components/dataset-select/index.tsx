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
 
import { useCallback, useMemo, useState, useEffect, useRef } from 'react';

import { BindBizType } from '@coze-workflow/base/api';
import {
  StandardNodeType,
  useWorkflowNode,
  useNodeTestId,
} from '@coze-workflow/base';
import { FilterKnowledgeType } from '@coze-data/knowledge-modal-base';
import { useKnowledgeListModal } from '@coze-data/knowledge-modal-adapter';
import { useBizWorkflowKnowledgeIDEFullScreenModal } from '@coze-data/knowledge-ide-adapter';
import { I18n } from '@coze-arch/i18n';
import { ConfigProvider } from '@coze-arch/bot-semi';
import { DatasetStatus } from '@coze-arch/bot-api/knowledge';
import { Button } from '@coze-arch/coze-design';

import { useGlobalState, useDataSetInfos, useSpaceId } from '@/hooks';

import { LibrarySelect } from '../library-select';
import { useDouyinKnowledgeListModal } from './use-douyin-knowledge-list-modal';

export const DatasetSelect = ({
  value: _value,
  onChange,
  readonly,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  readonly: boolean;
}) => {
  const { getNodeSetterId } = useNodeTestId();
  const addButtonTestID = getNodeSetterId('dataset-select-add');
  const libraryCardTestID = getNodeSetterId('dataset-select-card');

  // 初始化的时候会穿件来默认 value： [null]
  const value = useMemo(() => _value?.filter?.(d => !!d) || [], [_value]);

  const { dataSets, cacheDataSetInfo } = useDataSetInfos({ ids: value });
  const res = useWorkflowNode();
  const { type } = res;
  const isDatasetWrite = type === StandardNodeType.DatasetWrite;
  const knowledgeType = isDatasetWrite
    ? FilterKnowledgeType.TEXT
    : FilterKnowledgeType.ALL;
  const hiddenAddBtn = !!(isDatasetWrite && value?.length);

  const addKnowledge = useCallback(
    id => {
      onChange([...value, id]);
      knowledgePreviewModalClose();
    },
    [value, onChange],
  );

  const removeKnowledge = useCallback(
    id => {
      onChange(value.filter(_v => _v !== id));
      knowledgePreviewModalClose();
    },
    [value, onChange],
  );

  const [buttonType, setButtonType] = useState('add');
  const [curDateSetID, setCurDateSetID] = useState<string>();

  const curDataset = useMemo(
    () => dataSets.find(d => d.dataset_id === curDateSetID),
    [dataSets, curDateSetID],
  );
  const button = useMemo(
    () => (
      <Button
        // 增加详情页面添加knowledge详情页面，时禁用操作按钮去添加未启用的知识库
        disabled={
          readonly || curDataset?.status === DatasetStatus.DatasetForbid
        }
        onClick={() => {
          buttonType === 'add'
            ? addKnowledge(curDateSetID)
            : removeKnowledge(curDateSetID);
        }}
      >
        {buttonType === 'add'
          ? I18n.t('knowledge_add_btn_by_workflow')
          : I18n.t('knowledge_remove_btn_by_workflow')}
      </Button>
    ),
    [
      dataSets,
      buttonType,
      addKnowledge,
      removeKnowledge,
      curDateSetID,
      curDataset,
    ],
  );

  const {
    node: knowledgePreviewModal,
    open: knowledgePreviewModalOpen,
    close: knowledgePreviewModalClose,
  } = useBizWorkflowKnowledgeIDEFullScreenModal({
    navBarProps: {
      actionButtons: button,
    },
    biz: 'workflow',
  });

  const { projectId, getProjectApi, playgroundProps, bindBizID, bindBizType } =
    useGlobalState();
  const spaceID = useSpaceId();
  const isBindDouyin = bindBizType === BindBizType.DouYinBot;
  const newWindowRef = useRef<WindowProxy | null>();

  const { node, open, close } = useKnowledgeListModal({
    datasetList: value.map(d => ({
      dataset_id: d,
    })),
    onClickKnowledgeDetail: (datasetID: string) => {
      if (value.includes(datasetID)) {
        setButtonType('remove');
      } else {
        setButtonType('add');
      }
      setCurDateSetID(datasetID);
      knowledgePreviewModalOpen(datasetID);
      // close();
    },
    onDatasetListChange: list => {
      cacheDataSetInfo(list);
      onChange(list.map(l => l.dataset_id) as string[]);
    },
    defaultType: knowledgeType,
    // 传 undefined 则展示全量知识库
    knowledgeTypeConfigList: isDatasetWrite
      ? [FilterKnowledgeType.TEXT]
      : undefined,
    projectID: projectId,
    beforeCreate: shouldUpload => {
      if (shouldUpload && !projectId) {
        newWindowRef.current = window.open();
      }
    },
    onClickAddKnowledge: (id, unitType, shouldUpload) => {
      if (shouldUpload) {
        if (projectId) {
          const IDENav = getProjectApi()?.navigate;
          IDENav?.(`/knowledge/${id}?module=upload&type=${unitType}`);
        } else if (newWindowRef.current) {
          if (id) {
            newWindowRef.current.location = `/space/${spaceID}/knowledge/${id}/upload?type=${unitType}`;
          } else {
            newWindowRef.current.close();
          }
        }
      }
      close();
      if (projectId) {
        playgroundProps.refetchProjectResourceList?.();
      }
    },
  });

  const {
    node: douyinModal,
    open: openDouyinModal,
    close: closeDouyinModal,
  } = useDouyinKnowledgeListModal({
    spaceId: spaceID,
    botId: bindBizID || '',
    datasetList: value.map(d => ({
      dataset_id: d,
    })),
    onClickKnowledgeDetail: (datasetID: string) => {
      if (value.includes(datasetID)) {
        setButtonType('remove');
      } else {
        setButtonType('add');
      }
      setCurDateSetID(datasetID);
      knowledgePreviewModalOpen(datasetID);
    },
    onDatasetListChange: list => {
      cacheDataSetInfo(list);
      onChange(list.map(l => l.dataset_id) as string[]);
    },
    onCancel: () => {
      closeDouyinModal();
    },
  });

  useEffect(() => {
    // 知识库写入节点只能选一个知识库然后关闭，限制多选
    if (isDatasetWrite && value?.length) {
      close();
    }
  }, [value, close, isDatasetWrite]);

  return (
    <div className="relative">
      {/* semi 默认是挂载到 body 上，但是 workflow 中重写挂载到了当前 node 上，此处需要手动改写到 body 上，否则 knowledge 弹窗会打不开 */}
      <ConfigProvider getPopupContainer={() => document.body}>
        {knowledgePreviewModal}
        {isBindDouyin ? douyinModal : node}
      </ConfigProvider>
      <LibrarySelect
        libraries={dataSets?.map(
          ({
            dataset_id = '',
            name,
            description,
            icon_url,
            create_time = '',
            creator_id = '',
          }) => ({
            id: dataset_id,
            name,
            description,
            iconUrl: icon_url,
            // 无效知识库设为禁用
            isInvalid: !create_time && !creator_id,
          }),
        )}
        readonly={readonly}
        onDeleteLibrary={id => {
          onChange(value.filter(_v => _v !== id));
        }}
        onAddLibrary={() => (isBindDouyin ? openDouyinModal() : open())}
        onClickLibrary={id => {
          if (id) {
            setButtonType('remove');
            setCurDateSetID(id);
            knowledgePreviewModalOpen(id);
          }
        }}
        emptyText={
          isDatasetWrite
            ? I18n.t('kl_write_003')
            : I18n.t('workflow_knowledge_node_empty')
        }
        hideAddButton={hiddenAddBtn}
        addButtonTestID={addButtonTestID}
        libraryCardTestID={libraryCardTestID}
      />
    </div>
  );
};
