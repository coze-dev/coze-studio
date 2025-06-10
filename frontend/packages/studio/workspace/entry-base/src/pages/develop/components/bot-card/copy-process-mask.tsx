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
} from '@coze/coze-design/icons';
import { Button, Space } from '@coze/coze-design';
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
