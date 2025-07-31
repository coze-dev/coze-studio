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

import { useRequest } from 'ahooks';
import {
  type IntelligenceBasicInfo,
  IntelligenceStatus,
  TaskAction,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozLoading,
  IconCozWarningCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { Button, Space } from '@coze-arch/coze-design';
import { intelligenceApi } from '@coze-arch/bot-api';

export interface CopyProcessMaskProps {
  intelligenceBasicInfo: IntelligenceBasicInfo;
  onRetry?: (status: IntelligenceStatus | undefined) => void;
  onCancelCopyAfterFailed?: (status: IntelligenceStatus | undefined) => void;
}

export const CopyProcessMask: React.FC<CopyProcessMaskProps> = ({
  intelligenceBasicInfo,
  onRetry,
  onCancelCopyAfterFailed,
}) => {
  const { status } = intelligenceBasicInfo;

  const { run } = useRequest(
    async (action: TaskAction) => {
      const response = await intelligenceApi.ProcessEntityTask({
        entity_id: intelligenceBasicInfo.id,
        action,
      });
      return response.data?.entity_task?.entity_status;
    },
    {
      manual: true,
      onSuccess: (res, [action]) => {
        if (action === TaskAction.ProjectCopyCancel) {
          onCancelCopyAfterFailed?.(res);
        }
        if (action === TaskAction.ProjectCopyRetry) {
          onRetry?.(res);
        }
      },
    },
  );

  if (
    status !== IntelligenceStatus.CopyFailed &&
    status !== IntelligenceStatus.Copying
  ) {
    return null;
  }

  return (
    <div className="absolute w-full h-full flex items-center justify-center backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] left-0 top-0">
      <div className="coz-fg-secondary flex flex-col items-center gap-y-[12px]">
        {status === IntelligenceStatus.Copying ? (
          <>
            <IconCozLoading className="animate-spin" />
            <div>{I18n.t('project_ide_duplicate_loading')}</div>
          </>
        ) : null}
        {status === IntelligenceStatus.CopyFailed ? (
          <>
            <IconCozWarningCircleFillPalette className="coz-fg-hglt-red" />
            <div>{I18n.t('develop_list_card_copy_fail')}</div>
            <Space spacing={8}>
              <Button
                color="primary"
                onClick={() => {
                  run(TaskAction.ProjectCopyCancel);
                }}
              >
                {I18n.t('Cancel')}
              </Button>
              <Button
                color="hgltplus"
                onClick={() => {
                  run(TaskAction.ProjectCopyRetry);
                }}
              >
                {I18n.t('project_ide_toast_duplicate_fail_retry')}
              </Button>
            </Space>
          </>
        ) : null}
      </div>
    </div>
  );
};
