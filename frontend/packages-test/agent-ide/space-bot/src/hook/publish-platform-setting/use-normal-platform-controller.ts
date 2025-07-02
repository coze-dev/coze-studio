import { userStoreService } from '@coze-studio/user-store';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';

const useNormalPlatformController = () => {
  const userAuthInfos = userStoreService.useUserAuthInfo();
  const { getUserAuthInfos } = userStoreService;

  const revokeSuccess = async () => {
    const getUserAuthListEvent = createReportEvent({
      eventName: ReportEventNames.getUserAuthList,
    });
    try {
      await getUserAuthInfos();
      getUserAuthListEvent.success();
    } catch (error) {
      getUserAuthListEvent.error({ error, reason: error.message });
    }
  };

  return {
    revokeSuccess,
    userAuthInfos,
  };
};

export { useNormalPlatformController };
