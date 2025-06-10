import {
  type BizResourceType,
  useResourceCopyDispatch,
} from '@coze-project-ide/biz-components';
import { type resource_resource_common } from '@coze-arch/bot-api/plugin_develop';

export interface ResourceOperationProps {
  projectId: string;
}

export const useResourceOperation = ({ projectId }: ResourceOperationProps) => {
  const copyDispatch = useResourceCopyDispatch();
  return async ({
    scene,
    resource,
  }: {
    scene: resource_resource_common.ResourceCopyScene;
    resource?: BizResourceType;
  }) => {
    try {
      console.log(
        `[ResourceFolder]workflow resource copy dispatch, scene ${scene}>>>`,
        resource,
      );
      await copyDispatch({
        scene,
        res_id: resource?.id,
        res_type: resource?.res_type,
        project_id: projectId,
        res_name: resource?.name || '',
      });
    } catch (e) {
      console.error(
        `[ResourceFolder]workflow resource copy dispatch, scene ${scene} error>>>`,
        e,
      );
    }
  };
};
