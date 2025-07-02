import { workflowApi } from '@coze-workflow/base/api';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { ResourceType } from '@coze-arch/bot-api/permission_authz';
import { CollaboratorsBtn } from '@coze-workflow/resources-adapter';

// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { useGlobalState } from '../../../../hooks';
import { useCollaboratorsPay } from './use-collaborators-pay';

const InnerCollaboratorButton: React.FC = () => {
  const globalState = useGlobalState();
  const { info, workflowId, spaceId, isCollaboratorMode } = globalState;

  const { textMap, text } = useCollaboratorsPay();

  const onCollaborationSwitchChange = async (
    enable: boolean,
  ): Promise<void> => {
    sendTeaEvent(EVENT_NAMES.workflow_cooperation_switch_click, {
      workflow_id: globalState.workflowId,
      workspace_id: globalState.spaceId,
      switch_type: enable ? 1 : 0,
    });
    if (enable) {
      await workflowApi.OpenCollaborator({
        workflow_id: workflowId,
        space_id: spaceId,
      });
    } else {
      await workflowApi.CloseCollaborator({
        workflow_id: workflowId,
        space_id: spaceId,
      });
    }
    // 切换协作状态后刷新状态
    await globalState.reload();
  };

  return (
    <CollaboratorsBtn
      border
      resourceType={ResourceType.Workflow}
      resourceId={workflowId}
      ownerId={info?.creator?.id ?? ''}
      showCollaborationSwitch
      isCollaboration={isCollaboratorMode}
      onCollaborationSwitchChange={onCollaborationSwitchChange}
      shouldUpgrade={text}
      textMap={textMap}
    />
  );
};

export const CollaboratorsButton = () => {
  const globalState = useGlobalState();
  const { canCollaboration, readonly } = globalState;

  // 1. 灰度开关 2.团队空间 3.非只读
  if (!canCollaboration || readonly) {
    return null;
  }
  return <InnerCollaboratorButton />;
};
