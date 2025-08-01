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

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import {
  type CreatePersonalAccessTokenAndPermissionResponseData,
  type PersonalAccessToken,
} from '@coze-arch/bot-api/pat_permission_api';

import {
  useDeletePAT,
  useGetPATList,
  type FetchCustomPatList,
} from '../use-token';
export const usePatOperation = ({
  fetchCustomPatList,
  afterCancelPermissionModal,
}: {
  fetchCustomPatList?: FetchCustomPatList;
  afterCancelPermissionModal?: (isCreate: boolean) => void;
}) => {
  const { loading, dataSource, fetchData } = useGetPATList({
    fetchCustomPatList,
  });
  const { runDelete } = useDeletePAT({
    successHandle: () => {
      Toast.success({ content: I18n.t('Delete_success'), showClose: false });
      fetchData();
    },
  });
  const [showDataForm, setShowDataForm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [editInfo, setEditInfo] = useState<PersonalAccessToken>();
  const [successData, setSuccessData] =
    useState<CreatePersonalAccessTokenAndPermissionResponseData>();
  const onAddClick = () => {
    setIsCreate(true);
    setShowDataForm(true);
  };
  const editHandle = (v: PersonalAccessToken) => {
    setEditInfo(v);
    setIsCreate(false);
    setShowDataForm(true);
  };
  const onCancel = () => {
    setShowDataForm(false);
    setEditInfo(undefined);
    afterCancelPermissionModal?.(isCreate);
  };

  const createSuccessHandle = (
    data: CreatePersonalAccessTokenAndPermissionResponseData,
  ) => {
    setSuccessData(data);
    setEditInfo(undefined);
    setShowResult(true);
  };
  const refreshHandle = () => {
    fetchData();
    setShowDataForm(false);
    setEditInfo(undefined);
  };
  return {
    dataSource,
    loading,
    showDataForm,
    setShowDataForm,
    isCreate,
    editInfo,
    successData,
    onAddClick,
    createSuccessHandle,
    refreshHandle,
    editHandle,
    runDelete,
    onCancel,
    setIsCreate,
    showResult,
    setShowResult,
    fetchData,
  };
};
