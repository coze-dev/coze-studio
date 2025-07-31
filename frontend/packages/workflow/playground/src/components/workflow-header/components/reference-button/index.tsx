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

import { useState, useEffect } from 'react';

import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozBinding } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import {
  WorkflowStorageType,
  type DependencyTree,
} from '@coze-arch/bot-api/workflow_api';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { isDepEmpty } from '@coze-common/resource-tree';

import { WorkflowSaveService } from '@/services';
import { useSpaceId } from '@/hooks/use-space-id';

import { ReferenceModal } from '../reference-modal';

const DEFAULT_DATA = {
  node_list: [],
};

export const ReferenceButton = ({ workflowId }: { workflowId: string }) => {
  const spaceId = useSpaceId();
  const [data, setData] = useState<DependencyTree>(DEFAULT_DATA);
  const saveService = useService<WorkflowSaveService>(WorkflowSaveService);
  const [loading, setLoading] = useState(true);
  const [noReference, setNoReference] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const requestData = async (id: string) => {
    setLoading(true);
    const res = await workflowApi.DependencyTree({
      type: WorkflowStorageType.Library,
      library_info: {
        workflow_id: id,
        space_id: spaceId,
        draft: true,
      },
    });
    setData(res?.data || DEFAULT_DATA);
    const noRef = isDepEmpty(res?.data);
    if (noRef) {
      setNoReference(true);
    } else {
      setNoReference(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (workflowId) {
      requestData(workflowId);
    }
    const disposable = saveService.onSaved(() => {
      requestData(workflowId);
    });
    return () => {
      disposable?.dispose?.();
    };
  }, [workflowId]);

  const handleRetry = () => {
    requestData(workflowId);
  };
  return (
    <>
      <Tooltip
        content={
          noReference
            ? I18n.t(
                'library_workflow_header_reference_graph_entry_hover_no_reference',
              )
            : I18n.t(
                'library_workflow_header_reference_graph_entry_hover_view_graph',
              )
        }
        position="bottom"
      >
        <IconButton
          loading={loading}
          disabled={noReference}
          color="secondary"
          icon={<IconCozBinding />}
          onClick={() => setModalVisible(true)}
        />
      </Tooltip>
      <ReferenceModal
        data={data}
        spaceId={spaceId}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onRetry={handleRetry}
      />
    </>
  );
};
