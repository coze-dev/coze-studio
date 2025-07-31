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

import { workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { CustomError } from '@coze-arch/bot-error';
import { type ResourceInfo, ResType } from '@coze-arch/bot-api/plugin_develop';
import { useNavigate } from 'react-router-dom';

import { reporter, wait } from '@/utils';

import { type CommonActionProps, type CommonActionReturn } from './type';

export const useCopyAction = (props: CommonActionProps): CommonActionReturn => {
  const { spaceId } = props;
  const navigate = useNavigate();
  // copy
  const handleCopy = async (item: ResourceInfo) => {
    if (!item.res_id || !spaceId) {
      throw new CustomError('normal_error', 'miss workflowId or spaceID');
    }

    reporter.info({
      message: 'workflow_list_copy_row',
      meta: {
        workflowId: item.res_id,
      },
    });

    try {
      let isError = false;
      const { data } = await workflowApi.CopyWorkflow({
        space_id: spaceId,
        workflow_id: item.res_id,
      });
      isError = !data?.workflow_id;

      if (isError) {
        Toast.error(I18n.t('workflow_detail_toast_createcopy_failed'));
        reporter.error({
          message: 'workflow_list_copy_row_fail',
          error: new CustomError('normal_error', 'result no workflow'),
        });
        return;
      }

      Toast.success({
        content:
          item.res_type === ResType.Imageflow
            ? I18n.t('imageflow_detail_toast_createcopy_succeed')
            : I18n.t('workflow_detail_toast_createcopy_succeed'),
        showClose: false,
      });

      reporter.info({
        message: 'workflow_list_copy_row_success',
        meta: {
          workflowId: item.res_id,
        },
      });

      // Bottom line leader/follower delay
      await wait(300);
      // After copying, jump to the details page
      navigate(
        `/work_flow?workflow_id=${data.workflow_id}&space_id=${spaceId}`,
      );
    } catch (error) {
      reporter.error({
        message: 'workflow_list_copy_row_fail',
        error,
      });
      Toast.error(I18n.t('workflow_detail_toast_createcopy_failed'));
    }
  };
  return { actionHandler: handleCopy };
};
