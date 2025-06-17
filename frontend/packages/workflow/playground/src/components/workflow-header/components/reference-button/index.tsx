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
