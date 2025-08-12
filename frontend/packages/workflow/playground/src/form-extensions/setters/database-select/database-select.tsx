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

import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';
import { JsonViewer } from '@coze-common/json-viewer';
import { SelectDatabaseModal } from '@coze-data/database-v2';

import { useGlobalState } from '@/hooks';
import { LibrarySelect } from '@/form-extensions/components/library-select';
import { TagList } from '@/components/tag-list';
import { useOpenDatabaseDetail } from '@/components/database-detail-modal';

import { useTags } from './use-tags';
import { useModal } from './use-modal';
import { useLibraries } from './use-libraries';
import { type DatabaseSelectValue } from './types';

interface DatabaseSelectProps {
  value?: DatabaseSelectValue;
  onChange?: (newValue: DatabaseSelectValue) => void;
  readonly?: boolean;
  addButtonTestID?: string;
  libraryCardTestID?: string;
}

export const DatabaseSelect = ({
  value,
  onChange,
  readonly = false,
  addButtonTestID,
  libraryCardTestID,
}: DatabaseSelectProps) => {
  const { spaceId, projectId, getProjectApi, playgroundProps } =
    useGlobalState();
  const {
    isVisible: isSelectDatabaseModalVisible,
    openModal: openSelectDatabaseModal,
    closeModal: closeSelectDatabaseModal,
  } = useModal();
  const { openDatabaseDetail } = useOpenDatabaseDetail();
  const currentDatabaseID = value?.[0]?.databaseInfoID;
  const libraries = useLibraries();
  const tags = useTags(currentDatabaseID);

  function changeDatabase(id: string) {
    onChange?.([{ databaseInfoID: id }]);
  }

  function clearDatabase() {
    onChange?.([]);
  }

  function handleSelectDatabaseModalAdd(id: string) {
    changeDatabase(id);
    closeSelectDatabaseModal();
  }

  function handleLibrarySelectDelete() {
    Modal.confirm({
      title: I18n.t(
        'workflow_database_delete_confirm_modal_title',
        {},
        '确认移除该数据表？',
      ),
      content: I18n.t(
        'workflow_database_delete_confirm_modal_content',
        {},
        '移除后，该节点配置的相关内容均会被删除且无法恢复',
      ),
      onOk: () => {
        clearDatabase();
      },
      okText: I18n.t('workflow_confirm_modal_ok', {}, '确定'),
      cancelText: I18n.t('workflow_confirm_modal_cancel', {}, '取消'),
    });
  }

  function handleClickLibrarySelectLibrary(id: string) {
    openDatabaseDetailOfLibrarySelect(id);
  }

  function handleClickDatabase(id: string) {
    openDatabaseDetailOfLibrarySelect(id);
  }

  function openDatabaseDetailOfLibrarySelect(id: string) {
    openDatabaseDetail({
      databaseID: id,
    });
  }

  // In the operation and maintenance platform, you can directly display the database ID information, because the database information cannot be pulled in the operation and maintenance platform.
  if (IS_BOT_OP && value) {
    return <JsonViewer data={value} />;
  }

  return (
    <>
      <LibrarySelect
        readonly={readonly}
        libraries={libraries}
        onAddLibrary={openSelectDatabaseModal}
        onDeleteLibrary={handleLibrarySelectDelete}
        onClickLibrary={handleClickLibrarySelectLibrary}
        emptyText={I18n.t('workflow_database_node_database_empty')}
        renderLibrary={({ defaultLibraryRender }) => (
          <div>
            {defaultLibraryRender()}
            {tags?.length && tags.length > 0 ? (
              <TagList className="mt-[6px]" tags={tags} max={3} />
            ) : null}
          </div>
        )}
        hideAddButton={value && value?.length > 0}
        addButtonTestID={addButtonTestID}
        libraryCardTestID={libraryCardTestID}
      />
      <SelectDatabaseModal
        spaceId={spaceId}
        visible={isSelectDatabaseModalVisible}
        onClose={closeSelectDatabaseModal}
        onAddDatabase={handleSelectDatabaseModalAdd}
        onClickDatabase={handleClickDatabase}
        onCreateDatabase={id => {
          closeSelectDatabaseModal();
          playgroundProps.refetchProjectResourceList?.();
          getProjectApi()?.navigate(`/database/${id}`);
        }}
        enterFrom="workflow"
        projectID={projectId}
      />
    </>
  );
};
