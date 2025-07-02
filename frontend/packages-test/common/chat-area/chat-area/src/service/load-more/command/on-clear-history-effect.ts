import { LoadEffect } from '../load-command';
import { ReportErrorEventNames } from '../../../report-events/report-event-names';
import { ReportEventNames } from '../../../report-events';

export class OnClearHistoryEffect extends LoadEffect {
  run = () => {
    const {
      alignMessageIndexes,
      resetHasMore,
      resetCursors,
      reporter,
      resetLoadLockAndError,
    } = this.envTools;
    try {
      resetHasMore();
      resetCursors();
      alignMessageIndexes();
      resetLoadLockAndError();
      reporter.event({
        eventName: ReportEventNames.LoadMoreResetIndexStoreOnClearHistory,
      });
    } catch (e) {
      reporter.errorEvent({
        eventName:
          ReportErrorEventNames.LoadMoreResetIndexStoreOnClearHistoryFail,
        error: e as Error,
      });
    }
  };
}
