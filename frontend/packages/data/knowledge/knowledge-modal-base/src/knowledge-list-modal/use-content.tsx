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

import type { FC, ReactNode } from 'react';

import classNames from 'classnames';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { type FilterKnowledgeType } from '@coze-data/utils';
import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { type Dataset } from '@coze-arch/bot-api/knowledge';

import { DATA_REFACTOR_CLASS_NAME } from '@/constant';

import {
  useKnowledgeFilter,
  Scene,
  type DatasetFilterType,
} from './use-knowledge-filter';
import { KnowledgeCardListVertical } from './knowledge-card-list';

import s from './index.module.less';

export interface DataSetModalContentProps {
  datasetList: Dataset[];
  onDatasetListChange: (list: Dataset[]) => void;
  onClickAddKnowledge?: (
    datasetId: string,
    type: UnitType,
    shouldUpload?: boolean,
  ) => void;
  beforeCreate?: (shouldUpload: boolean) => void;
  onClickKnowledgeDetail?: (knowledgeID: string) => void;
  canCreate?: boolean;
  defaultType?: FilterKnowledgeType;
  knowledgeTypeConfigList?: FilterKnowledgeType[];

  projectID?: string;
  showFilters?: DatasetFilterType[];
  hideHeader?: boolean;
  createKnowledgeModal?: {
    modal: ReactNode;
    open: () => void;
    close: () => void;
  };
}

const useKnowledgeListModalContent = ({
  datasetList,
  onDatasetListChange,
  onClickAddKnowledge,
  beforeCreate,
  onClickKnowledgeDetail,
  canCreate = true,
  defaultType,
  knowledgeTypeConfigList,
  projectID,
  showFilters = ['scope-type', 'search-type', 'query-input'],
  hideHeader,
  createKnowledgeModal,
}: DataSetModalContentProps) => {
  const botId = useBotInfoStore(state => state.botId);

  const { renderContentFilter, renderSearch, renderCreateBtn, renderFilters } =
    useKnowledgeFilter({
      hideHeader,
      showFilters,
      scene: Scene.MODAL,
      headerClassName: classNames(
        s['dataset-header'],
        DATA_REFACTOR_CLASS_NAME,
      ),
      onClickAddKnowledge,
      beforeCreate,
      canCreate,
      defaultType,
      knowledgeTypeConfigList,
      projectID,
      createKnowledgeModal,
      children: ({ list, loading, noMore, searchType }) => (
        <KnowledgeCardListVertical
          searchType={searchType}
          noMore={noMore}
          list={list}
          loading={loading}
          onAdd={async dataset => {
            await onDatasetListChange([...datasetList, dataset]);
            sendTeaEvent(EVENT_NAMES.click_database_select, {
              operation: 'add',
              bot_id: botId,
            });
            // Toast.success({
            //   showClose: false,
            //   content: I18n.t('bot_edit_dataset_added_toast', {
            //     dataset_name: dataset.name || '',
            //   }),
            //   style: {
            //     wordWrap: 'break-word',
            //   },
            // });
          }}
          onRemove={dataset => {
            onDatasetListChange(
              datasetList.filter(
                item => item.dataset_id !== dataset.dataset_id,
              ),
            );
            sendTeaEvent(EVENT_NAMES.click_database_select, {
              operation: 'remove',
              bot_id: botId,
            });
            // Toast.success({
            //   showClose: false,
            //   content: I18n.t('bot_edit_dataset_removed_toast', {
            //     dataset_name: dataset.name || '',
            //   }),
            //   style: {
            //     wordWrap: 'break-word',
            //   },
            // });
          }}
          isAdded={id => datasetList.some(dataset => dataset.dataset_id === id)}
          onClickKnowledgeDetail={onClickKnowledgeDetail}
        />
      ),
    });

  return {
    renderContent: renderContentFilter,
    renderSearch,
    renderCreateBtn,
    renderFilters,
  };
};

const KnowledgeListModalContent: FC<DataSetModalContentProps> = ({
  datasetList,
  onDatasetListChange,
  onClickAddKnowledge,
  beforeCreate,
  onClickKnowledgeDetail,
  canCreate = true,
  defaultType,
  knowledgeTypeConfigList,
  projectID,
  createKnowledgeModal,
}) => {
  const { renderContent } = useKnowledgeListModalContent({
    datasetList,
    onDatasetListChange,
    onClickAddKnowledge,
    beforeCreate,
    onClickKnowledgeDetail,
    canCreate,
    defaultType,
    knowledgeTypeConfigList,
    projectID,
    createKnowledgeModal,
  });

  return <>{renderContent()}</>;
};

export { useKnowledgeListModalContent, KnowledgeListModalContent };
