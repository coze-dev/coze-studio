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

import { useState } from 'react';

import classNames from 'classnames';
import { FilterKnowledgeType } from '@coze-data/utils';
import { type UnitType } from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import {
  type UIModalProps,
  UICompositionModal,
  UICompositionModalSider,
  UICompositionModalMain,
} from '@coze-arch/bot-semi';
import { type Dataset } from '@coze-arch/bot-api/knowledge';

import { DATA_REFACTOR_CLASS_NAME } from '@/constant';

import {
  useKnowledgeListModalContent,
  KnowledgeListModalContent,
} from './use-content';
import SiderCategory from './sider-category';

import styles from './index.module.less';

export interface UseKnowledgeListModalParams {
  datasetList: Dataset[];
  onDatasetListChange: (list: Dataset[]) => void;
  onClickAddKnowledge?: (
    datasetId: string,
    type: UnitType,
    shouldUpload?: boolean,
  ) => void;
  beforeCreate?: (shouldUpload: boolean) => void;
  onClickKnowledgeDetail?: (knowledgeID: string) => void;
  modalProps?: UIModalProps;
  canCreate?: boolean;
  defaultType?: FilterKnowledgeType;
  knowledgeTypeConfigList?: FilterKnowledgeType[];

  projectID?: string;
  hideCreate?: boolean;
  createKnowledgeModal?: {
    modal: React.ReactNode;
    open: () => void;
    close: () => void;
  };
}

export interface UseKnowledgeListReturnValue {
  node: JSX.Element;
  open: () => void;
  close: () => void;
}

export const useKnowledgeListModal = ({
  datasetList,
  onDatasetListChange,
  onClickAddKnowledge,
  beforeCreate,
  onClickKnowledgeDetail,
  modalProps,
  canCreate = true,
  defaultType,
  knowledgeTypeConfigList,
  projectID,
  hideCreate,
  createKnowledgeModal,
}: UseKnowledgeListModalParams): UseKnowledgeListReturnValue => {
  const [visible, setVisible] = useState(false);

  const [category, setCategory] = useState<'library' | 'project'>(
    projectID ? 'project' : 'library',
  );

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const { renderContent, renderSearch, renderCreateBtn, renderFilters } =
    useKnowledgeListModalContent({
      hideHeader: true,
      showFilters: ['scope-type', 'search-type'],
      datasetList,
      onDatasetListChange,
      onClickAddKnowledge,
      beforeCreate,
      onClickKnowledgeDetail,
      canCreate,
      defaultType,
      knowledgeTypeConfigList,
      // Need to optimize attribute selection
      projectID: category === 'project' ? projectID : '',
      createKnowledgeModal,
    });

  return {
    node: (
      <UICompositionModal
        type="base-composition"
        header={I18n.t('dataset_set_title')}
        visible={visible}
        className={classNames(
          styles.modal,
          styles['upgrade-level'],
          DATA_REFACTOR_CLASS_NAME,
        )}
        centered
        onCancel={handleClose}
        filter={
          <div className="flex justify-between gap-[24px]">
            {renderFilters()}
          </div>
        }
        sider={
          <UICompositionModalSider className="!pt-[16px]">
            <UICompositionModalSider.Header className="flex flex-col gap-[16px]">
              {renderSearch()}
              {hideCreate ? null : renderCreateBtn()}
            </UICompositionModalSider.Header>
            <UICompositionModalSider.Content className="flex flex-col gap-[4px] mt-[16px]">
              <SiderCategory
                label={I18n.t('project_resource_modal_library_resources', {
                  resource: I18n.t('resource_type_knowledge'),
                })}
                onClick={() => {
                  setCategory('library');
                }}
                selected={category === 'library'}
              />
              {projectID ? (
                <SiderCategory
                  label={I18n.t('project_resource_modal_project_resources', {
                    resource: I18n.t('resource_type_knowledge'),
                  })}
                  onClick={() => {
                    setCategory('project');
                  }}
                  selected={category === 'project'}
                />
              ) : null}
            </UICompositionModalSider.Content>
          </UICompositionModalSider>
        }
        content={
          <UICompositionModalMain className="px-[12px]">
            {renderContent()}
          </UICompositionModalMain>
        }
        {...modalProps}
      ></UICompositionModal>
    ),
    close: handleClose,
    open: handleOpen,
  };
};

export { KnowledgeCard } from './knowledge-card';
export {
  KnowledgeListModalContent,
  useKnowledgeListModalContent,
  FilterKnowledgeType,
};

export { KnowledgeCardListVertical } from './knowledge-card-list';
