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

import { useEffect } from 'react';

import { type FetchCustomPatList } from '@/hooks/pat/use-token';
import { usePatOperation } from '@/hooks/pat/action/use-pat-operation';

import { TopBody } from './top-body';
import { ResultModal } from './result-modal';
import { PermissionModal, type PermissionModalProps } from './permission-modal';
import { DataTable, type GetCustomDataConfig } from './data-table';
export interface PATProps {
  size?: 'small' | 'default';
  type?: 'primary' | 'default';
  renderTopBodySlot?: (options: {
    openAddModal: () => void;
  }) => React.ReactNode;
  renderDataEmptySlot?: () => React.ReactElement | null;
  getCustomDataConfig?: GetCustomDataConfig;
  fetchCustomPatList?: FetchCustomPatList;
  renderPermissionModal?: (options: PermissionModalProps) => void;
  afterCancelPermissionModal?: (isCreate: boolean) => void;
}
export const PatBody: React.FC<PATProps> = ({
  size,
  type,
  renderTopBodySlot,
  renderDataEmptySlot,
  getCustomDataConfig,
  fetchCustomPatList,
  renderPermissionModal,
  afterCancelPermissionModal,
}) => {
  const {
    onAddClick,
    loading,
    dataSource,
    editHandle,
    runDelete,
    refreshHandle,
    showDataForm,
    isCreate,
    createSuccessHandle,
    onCancel,
    successData,
    showResult,
    setShowResult,
    editInfo,
    fetchData,
  } = usePatOperation({ fetchCustomPatList, afterCancelPermissionModal });

  useEffect(() => {
    fetchData();
  }, []);
  const permissionModalOptions = {
    isCreate,
    onRefresh: refreshHandle,
    editInfo,
    onCreateSuccess: createSuccessHandle,
    onCancel,
  };
  return (
    <div className="w-full h-full flex flex-col">
      {renderTopBodySlot?.({ openAddModal: onAddClick }) || (
        <TopBody openAddModal={onAddClick} />
      )}
      <DataTable
        size={size}
        type={type}
        loading={loading}
        dataSource={dataSource}
        onEdit={editHandle}
        onDelete={runDelete}
        onAddClick={onAddClick}
        renderDataEmptySlot={renderDataEmptySlot}
        getCustomDataConfig={getCustomDataConfig}
      />
      {showDataForm
        ? renderPermissionModal?.(permissionModalOptions) || (
            <PermissionModal {...permissionModalOptions} />
          )
        : null}
      <ResultModal
        data={successData}
        visible={showResult}
        onOk={() => setShowResult(false)}
      />
    </div>
  );
};
