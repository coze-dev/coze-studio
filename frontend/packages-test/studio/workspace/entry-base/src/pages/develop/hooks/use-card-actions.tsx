import { type Dispatch, type SetStateAction } from 'react';

import { cloneDeep, merge } from 'lodash-es';
import { produce } from 'immer';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import {
  type IntelligenceBasicInfo,
  type IntelligenceData,
} from '@coze-arch/bot-api/intelligence_api';
import { useCopyProjectModal } from '@coze-studio/project-entity-adapter';

import { type DraftIntelligenceList } from '../type';
import { produceCopyIntelligenceData } from '../page-utils/copy';
import { type AgentCopySuccessCallback } from '../components/bot-card/menu-actions';

export const useCardActions = ({
  isPersonalSpace,
  mutate,
}: {
  isPersonalSpace: boolean;
  mutate: Dispatch<SetStateAction<DraftIntelligenceList | undefined>>;
}) => {
  const { modalContextHolder: copyModalHolder, openModal: onCopyProject } =
    useCopyProjectModal({
      onSuccess: ({ basicInfo, templateId, ownerInfo }) => {
        mutate(prev =>
          produce(prev, draft => {
            const target = draft?.list.find(
              intelligence => intelligence.basic_info?.id === templateId,
            );

            if (!target) {
              return;
            }

            const copyData = produceCopyIntelligenceData({
              originTemplateData: target,
              newCopyData: { basicInfo, ownerInfo },
            });
            draft?.list.unshift(copyData);
          }),
        );
      },
    });

  const mutateIntelligenceBasicInfo = (info: IntelligenceBasicInfo) => {
    mutate(prev =>
      produce(prev, draft => {
        const target = draft?.list.find(i => i.basic_info?.id === info.id);
        if (!target) {
          return;
        }
        target.basic_info = info;
      }),
    );
  };

  const onCopyAgent: AgentCopySuccessCallback = param => {
    mutate(prev =>
      produce(prev, draft => {
        const target = draft?.list.find(
          intelligence => intelligence.basic_info?.id === param.templateId,
        );

        if (!target) {
          return;
        }

        const copyData = produceCopyIntelligenceData({
          originTemplateData: target,
          newCopyData: {
            ownerInfo: param.ownerInfo,
            basicInfo: merge({}, target.basic_info, {
              id: param.id,
              name: param.name,
            }),
          },
        });
        draft?.list.unshift(copyData);
      }),
    );
  };

  const onDeleteMutate = ({ id }: { id: string }) => {
    mutate(prev =>
      produce(prev, draft => {
        if (!draft?.list) {
          return;
        }
        draft.list = draft.list.filter(item => item.basic_info?.id !== id);
      }),
    );
  };

  const onUpdate = (intelligenceData: IntelligenceData) => {
    mutate(prev => {
      if (!prev) {
        return undefined;
      }
      const idx = prev.list.findIndex(
        item => item.basic_info?.id === intelligenceData.basic_info?.id,
      );

      if (idx < 0) {
        return;
      }
      const clonedList = cloneDeep(prev?.list ?? []);
      clonedList.splice(idx, 1, intelligenceData);
      return {
        ...prev,
        list: clonedList,
      };
    });
  };

  const onClick = (intelligenceData: IntelligenceData) => {
    sendTeaEvent(EVENT_NAMES.workspace_action_front, {
      space_id: intelligenceData.basic_info?.space_id ?? '',
      space_type: isPersonalSpace ? 'personal' : 'teamspace',
      tab_name: 'develop',
      action: 'click',
      id: intelligenceData.basic_info?.id,
      name: intelligenceData.basic_info?.name,
      type: 'agent',
    });
  };

  return {
    contextHolder: <>{copyModalHolder}</>,
    actions: {
      onClick,
      onCopyProject,
      onCopyAgent,
      onUpdate,
      onRetryCopy: mutateIntelligenceBasicInfo,
      onCancelCopyAfterFailed: mutateIntelligenceBasicInfo,
      onDeleteMutate,
    },
  };
};
