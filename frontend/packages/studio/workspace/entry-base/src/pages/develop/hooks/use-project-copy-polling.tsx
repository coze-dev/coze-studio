import { useNavigate } from 'react-router-dom';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { produce } from 'immer';
import {
  type IntelligenceData,
  IntelligenceStatus,
  IntelligenceType,
  TaskAction,
} from '@coze-arch/idl/intelligence_api';
import { CopyTaskType } from '@coze-arch/idl';
import { I18n } from '@coze-arch/i18n';
import { Button, Toast } from '@coze-arch/coze-design';
import { intelligenceApi } from '@coze-arch/bot-api';

import { type DraftIntelligenceList } from '../type';
import {
  intelligenceCopyTaskPollingService,
  type PollCopyTaskEvent,
} from '../service/intelligence-copy-task-polling-service';

const registerCopyTaskPolling = (data: IntelligenceData[]) => {
  intelligenceCopyTaskPollingService.registerPolling(
    data
      .filter(
        intelligence =>
          intelligence.type === IntelligenceType.Project &&
          intelligence.basic_info?.status === IntelligenceStatus.Copying,
      )
      .map(i => ({
        entity_id: i.basic_info?.id,
        task_type: CopyTaskType.ProjectCopy,
      })),
  );
};

export const useProjectCopyPolling = ({
  spaceId,
  listData,
  mutate,
}: {
  spaceId: string;
  mutate: Dispatch<SetStateAction<DraftIntelligenceList | undefined>>;
  listData?: IntelligenceData[];
}) => {
  const navigate = useNavigate();
  const navigateToProjectIDE = (inputProjectId: string) =>
    navigate(`/space/${spaceId}/project-ide/${inputProjectId}`);

  useEffect(() => {
    if (listData) {
      registerCopyTaskPolling(listData);
    }
  }, [listData]);

  useEffect(() => {
    const onTaskUpdate = (list: PollCopyTaskEvent['onCopyTaskUpdate']) => {
      mutate(prev =>
        produce(prev, draft => {
          list.forEach(task => {
            const target = draft?.list.find(
              intelligence => intelligence.basic_info?.id === task.entity_id,
            );
            if (!target || !target.basic_info) {
              return;
            }
            target.basic_info.status = task.entity_status;
          });
        }),
      );
      // 需要重新封装下
      list.forEach(item => {
        if (item.entity_status === IntelligenceStatus.Using) {
          const successToastId = Toast.success({
            content: (
              <>
                {I18n.t('project_ide_toast_duplicate_success')}
                <Button
                  className="ml-6px"
                  color="primary"
                  onClick={() => {
                    Toast.close(successToastId);
                    navigateToProjectIDE(item.entity_id ?? '');
                  }}
                >
                  {I18n.t('project_ide_toast_duplicate_view')}
                </Button>
              </>
            ),
            showClose: false,
          });
          return;
        }
        if (item.entity_status === IntelligenceStatus.CopyFailed) {
          const failedToastId = Toast.error({
            content: (
              <>
                {I18n.t('project_ide_toast_duplicate_fail')}
                <Button
                  className="ml-6px"
                  color="primary"
                  onClick={async () => {
                    Toast.close(failedToastId);
                    const response = await intelligenceApi.ProcessEntityTask({
                      entity_id: item.entity_id,
                      action: TaskAction.ProjectCopyRetry,
                    });
                    mutate(prev =>
                      produce(prev, draft => {
                        const target = draft?.list.find(
                          intelligence =>
                            intelligence.basic_info?.id === item.entity_id,
                        );

                        if (!target || !target.basic_info) {
                          return;
                        }
                        target.basic_info.status =
                          response.data?.entity_task?.entity_status;
                      }),
                    );
                  }}
                >
                  {I18n.t('project_ide_toast_duplicate_fail_retry')}
                </Button>
              </>
            ),
            showClose: false,
          });
          return;
        }
      });
    };
    intelligenceCopyTaskPollingService.eventCenter.on(
      'onCopyTaskUpdate',
      onTaskUpdate,
    );
    return () => {
      intelligenceCopyTaskPollingService.clearAll();
      intelligenceCopyTaskPollingService.eventCenter.off(
        'onCopyTaskUpdate',
        onTaskUpdate,
      );
    };
  }, []);
};
