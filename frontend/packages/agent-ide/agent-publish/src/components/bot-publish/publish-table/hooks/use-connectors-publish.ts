import { useParams } from 'react-router-dom';

import { useLockFn, useRequest } from 'ahooks';
import { type PublisherBotInfo } from '@coze-agent-ide/space-bot';
import { verifyBracesAndToast } from '@coze-studio/bot-detail-store';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { CustomError } from '@coze-arch/bot-error';
import {
  type PublishDraftBotData,
  PublishType,
} from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

export interface UsePublishParamsType {
  botId: string;
  changeLog: string;
  connectors: Record<string, Record<string, string>>;
  publishId: string;
}

export interface UsePublishProps {
  onSuccess: (res: PublishDraftBotData) => void;
  botInfo: PublisherBotInfo;
}

export interface UsePublishType {
  handlePublishBot: (params: UsePublishParamsType) => void;
  loading: boolean;
}

const publishBotEvent = createReportEvent({
  eventName: ReportEventNames.publishBot,
});

const hasBracesErrorI18nKey = 'bot_prompt_bracket_error';

export const useConnectorsPublish = ({
  onSuccess,
  botInfo,
}: UsePublishProps): UsePublishType => {
  const { commit_version, space_id = '' } = useParams<DynamicParams>();
  const { runAsync: publishBot, loading } = useRequest(
    async (params: UsePublishParamsType) => {
      const mode = botInfo.botMode;
      const { botId, changeLog, connectors, publishId } = params;

      if (!verifyBracesAndToast(botInfo.prompt)) {
        throw new CustomError(
          ReportEventNames.publishBot,
          hasBracesErrorI18nKey,
        );
      }

      const resp = await DeveloperApi.PublishDraftBot({
        space_id,
        bot_id: botId,
        history_info: changeLog,
        connectors,
        botMode: mode,
        publish_id: publishId,
        commit_version: commit_version ?? '',
        publish_type: PublishType.OnlinePublish,
      });

      return resp.data;
    },
    {
      manual: true,
      onBefore: () => {
        publishBotEvent.start();
      },
      onSuccess: resp => {
        publishBotEvent.success();
        if (resp?.publish_result) {
          onSuccess(resp);
        }
      },
      onError: e => {
        if (e.message === hasBracesErrorI18nKey) {
          return;
        }
        publishBotEvent.error({
          error: e,
          reason: 'publish_bot_error',
        });
      },
    },
  );

  const handlePublishBot = useLockFn(async (params: UsePublishParamsType) => {
    await publishBot(params);
  });

  return {
    handlePublishBot,
    loading,
  };
};
