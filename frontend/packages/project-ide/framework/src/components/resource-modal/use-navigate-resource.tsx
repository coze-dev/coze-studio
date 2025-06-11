import { ResType } from '@coze-arch/bot-api/plugin_develop';

export const useNavigateResource =
  ({
    resourceId,
    resourceType,
    spaceId,
  }: {
    resourceId?: string;
    resourceType?: ResType;
    spaceId?: string;
  }) =>
  () => {
    switch (resourceType) {
      case ResType.Plugin:
        window.open(`/space/${spaceId}/plugin/${resourceId}`);
        break;
      case ResType.Workflow:
      case ResType.Imageflow:
        window.open(`/work_flow?workflow_id=${resourceId}&space_id=${spaceId}`);
        break;
      case ResType.Knowledge:
        window.open(`/space/${spaceId}/knowledge/${resourceId}`);
        break;
      case ResType.UI:
        window.open(`/space/${spaceId}/widget/${resourceId}`);
        break;
      case ResType.Database:
        window.open(
          `/space/${spaceId}/database/${resourceId}?page_mode=normal`,
        );
        break;
      default:
        return;
    }
  };
