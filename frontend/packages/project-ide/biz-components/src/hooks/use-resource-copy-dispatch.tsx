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

import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { Button, Space, Toast, Typography } from '@coze-arch/coze-design';
import {
  type ResourceCopyDispatchRequest,
  ResourceCopyScene,
  type ResourceCopyTaskDetail,
} from '@coze-arch/bot-api/plugin_develop';
import {
  DisposableCollection,
  getURIByResource,
  ModalService,
  useIDEService,
  useProjectIDEServices,
  useSpaceId,
} from '@coze-project-ide/framework';

import { resTypeDTOToVO } from '@/utils';
import { usePrimarySidebarStore } from '@/stores';
import { BizResourceTypeEnum } from '@/resource-folder-coze';

import { useOpenResource } from './use-open-resource';

export const useResourceCopyDispatch = () => {
  const modalService = useIDEService<ModalService>(ModalService);
  const refetch = usePrimarySidebarStore(state => state.refetch);
  const projectIDEServices = useProjectIDEServices();
  const openResource = useOpenResource();
  const spaceId = useSpaceId();
  const viewResource = ({
    scene,
    taskInfo,
  }: {
    scene?: ResourceCopyScene;
    taskInfo?: ResourceCopyTaskDetail;
  }) => {
    if (!taskInfo?.res_type || !taskInfo?.res_id || !scene) {
      return;
    }
    const openInIDE =
      scene &&
      [
        ResourceCopyScene.CopyProjectResource,
        ResourceCopyScene.CopyResourceFromLibrary,
      ].includes(scene);

    const resourceType = resTypeDTOToVO(taskInfo.res_type);
    const resId = taskInfo.res_id;

    if (openInIDE) {
      openResource({
        resourceType: resTypeDTOToVO(taskInfo.res_type),
        resourceId: taskInfo.res_id,
      });
    } else {
      if (resourceType === BizResourceTypeEnum.Workflow) {
        window.open(`/work_flow?space_id=${spaceId}&workflow_id=${resId}`);
      } else {
        window.open(
          `/space/${spaceId}/${resourceType}/${resId}?from=project`,
          '_blank',
        );
      }
    }
  };
  const showToast = ({
    scene,
    taskInfo,
    hideViewBtn,
  }: {
    scene?: ResourceCopyScene;
    taskInfo?: ResourceCopyTaskDetail;
    hideViewBtn?: boolean;
  }) => {
    let message = '';

    switch (scene) {
      case ResourceCopyScene.CopyProjectResource:
        message = I18n.t('project_toast_copy_successful');
        break;
      case ResourceCopyScene.CopyResourceToLibrary:
        message = I18n.t('resource_toast_copy_to_library_success');
        break;
      case ResourceCopyScene.MoveResourceToLibrary:
        message = I18n.t('resource_toast_move_to_library_success');
        break;
      case ResourceCopyScene.CopyResourceFromLibrary:
        message = I18n.t('project_toast_successfully_imported_from_library');
        break;
      default:
        break;
    }

    Toast.success({
      content: (
        <Space spacing={6}>
          <Typography.Text>{message}</Typography.Text>
          {hideViewBtn ? null : (
            <Button
              color="primary"
              size="small"
              onClick={() => viewResource({ scene, taskInfo })}
            >
              {I18n.t('resource_toast_view_resource')}
            </Button>
          )}
        </Space>
      ),
    });
  };
  return async (
    props: ResourceCopyDispatchRequest,
  ): Promise<ResourceCopyTaskDetail | undefined> => {
    const disposables = new DisposableCollection();
    try {
      const taskInfo = await new Promise<ResourceCopyTaskDetail | undefined>(
        (resolve, reject) => {
          modalService.startPolling(props);
          disposables.pushAll([
            modalService.onSuccess(_taskInfo => {
              disposables.dispose();
              refetch();
              resolve(_taskInfo);
            }),
            modalService.onError(err => {
              disposables.dispose();
              reject(err);
            }),
            modalService.onCancel(() => {
              disposables.dispose();
              reject(new Error('cancelled'));
            }),
          ]);
        },
      );

      const hideViewBtn =
        props.scene === ResourceCopyScene.CopyResourceFromLibrary;
      showToast({ scene: props.scene, taskInfo, hideViewBtn });
      if (hideViewBtn) {
        viewResource({ scene: props.scene, taskInfo });
      }
      if (props.scene === ResourceCopyScene.MoveResourceToLibrary) {
        const uri = getURIByResource(
          resTypeDTOToVO(props.res_type) ?? '',
          props.res_id ?? '',
        );
        projectIDEServices.view.closeWidgetByUri(uri);
      }
      return taskInfo;
    } catch (err) {
      console.error('error dispatch resource', err);
    }
  };
};
