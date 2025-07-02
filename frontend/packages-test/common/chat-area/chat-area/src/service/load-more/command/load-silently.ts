import { LoadDirection } from '@coze-common/chat-core';

import { LoadCommand } from '../load-command';
import { type LoadAction } from '../../../store/message-index';
import { ReportErrorEventNames } from '../../../report-events/report-event-names';
import { getReportError, ReportEventNames } from '../../../report-events';

export class LoadSilently extends LoadCommand {
  action: LoadAction = 'load-silently';
  async load() {
    const {
      loadLockErrorHelper,
      readEnvValues,
      reporter,
      insertMessages,
      messageIndexHelper,
    } = this.envTools;
    const action = 'load-silently';
    const { loadLock } = loadLockErrorHelper.onLoadStart(action);
    const { nextCursor: cursor } = readEnvValues();
    try {
      reporter.event({
        eventName: ReportEventNames.LoadSilently,
        meta: {
          cursor,
        },
      });
      const loadDirection = LoadDirection.Next;
      const res = await this.envTools.loadRequest({
        cursor,
        loadDirection,
      });

      const isValidLock = loadLockErrorHelper.verifyLock(action, loadLock);
      if (!isValidLock) {
        return;
      }
      await this.envTools.waitChatProcessFinish();
      insertMessages(res, { toLatest: true });
      messageIndexHelper.updateIndexAndHasMoreAfterLoad(res, {
        refreshIndexByRequest: true,
        loadDirection,
      });

      loadLockErrorHelper.onLoadSuccess(action);
    } catch (e) {
      loadLockErrorHelper.onLoadError(action);
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadSilentlyFail,
        ...getReportError(e),
      });
    }
  }
}
