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
