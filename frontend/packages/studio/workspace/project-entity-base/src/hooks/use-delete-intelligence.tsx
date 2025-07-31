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

import { useRef, useState } from 'react';

import { isObject } from 'lodash-es';
import { useRequest } from 'ahooks';
import { DeveloperApi, intelligenceApi } from '@coze-arch/bot-api';

import { DeleteProjectModal } from '../components/delete-project-modal';

interface DeleteAgentParam {
  spaceId: string;
  agentId: string;
}

interface DeleteProjectParam {
  projectId: string;
}

const isAgentParam = (value: unknown): value is DeleteAgentParam =>
  isObject(value) && 'agentId' in value;

const isProjectParam = (value: unknown): value is DeleteProjectParam =>
  isObject(value) && 'projectId' in value;

export type DeleteIntelligenceParam = (
  | DeleteAgentParam
  | DeleteProjectParam
) & { name: string };

export const useDeleteIntelligence = (props?: {
  onDeleteProjectSuccess?: (param: DeleteProjectParam) => void;
  onDeleteAgentSuccess?: (param: DeleteAgentParam) => void;
}) => {
  const [deleteIntelligenceName, setDeleteIntelligenceName] =
    useState<string>('');

  const deleteParamsRef = useRef<DeleteProjectParam | DeleteAgentParam>();

  const [visible, setVisible] = useState<boolean>(false);

  const [name, setName] = useState<string>();

  const onCloseModal = () => {
    setVisible(false);
    setDeleteIntelligenceName('');
    setName('');
    deleteParamsRef.current = undefined;
  };

  const onDeleteCancel = () => {
    onCloseModal();
  };

  const { loading, runAsync } = useRequest(
    async (request: DeleteAgentParam | DeleteProjectParam) => {
      if (isAgentParam(request)) {
        const { spaceId, agentId } = request;
        await DeveloperApi.DeleteDraftBot({
          space_id: spaceId,
          bot_id: agentId,
        });
        return;
      }

      if (isProjectParam(request)) {
        const { projectId } = request;
        await intelligenceApi.DraftProjectDelete({ project_id: projectId });
      }
    },
    {
      manual: true,
      onSuccess: (_m, [p]) => {
        onCloseModal();
        if (isAgentParam(p)) {
          props?.onDeleteAgentSuccess?.(p);
          return;
        }
        if (isProjectParam(p)) {
          props?.onDeleteProjectSuccess?.(p);
          return;
        }
      },
    },
  );

  const onDelete = () => {
    if (!deleteParamsRef.current) {
      return;
    }
    return runAsync(deleteParamsRef.current);
  };

  return {
    modalContextHolder: (
      <DeleteProjectModal
        maskClosable={false}
        value={name}
        onChange={setName}
        placeholder={deleteIntelligenceName}
        visible={visible}
        onCancel={onDeleteCancel}
        onOk={onDelete}
        okButtonProps={{
          disabled: deleteIntelligenceName !== name,
          loading,
        }}
      />
    ),
    deleteIntelligence: ({
      name: deleteName,
      ...restParam
    }: DeleteIntelligenceParam) => {
      setVisible(true);
      setDeleteIntelligenceName(deleteName);
      deleteParamsRef.current = restParam;
    },
  };
};
