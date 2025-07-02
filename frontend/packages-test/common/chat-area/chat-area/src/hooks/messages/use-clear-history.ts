import { getUnselectAllImplement } from '../public/use-unselect-all';
import { useMethodCommonDeps } from '../context/use-method-common-deps';
import { FileManagerEventNames, fileManager } from '../../utils/file-manage';
import { ReportEventNames, getReportError } from '../../report-events';
import { type MethodCommonDeps } from '../../plugin/types';
import { getStopRespondingImplement } from './use-stop-responding';

export const useClearHistory = () => {
  const commonDeps = useMethodCommonDeps();

  const fn = getClearHistoryImplement(commonDeps);
  return fn;
};

export const getClearHistoryImplement =
  (deps: MethodCommonDeps) => async () => {
    const {
      context: { lifeCycleService, reporter, eventCallback },
      storeSet,
      services: { loadMoreClient, chatActionLockService },
    } = deps;

    const {
      useGlobalInitStore,
      useMessagesStore,
      useSectionIdStore,
      useSuggestionsStore,
    } = storeSet;
    const { setLatestSectionId } = useSectionIdStore.getState();
    const chatCore = useGlobalInitStore.getState().getChatCore();
    const { clearMessage } = useMessagesStore.getState();
    const { clearSuggestions } = useSuggestionsStore.getState();
    const unselectAll = getUnselectAllImplement(deps);
    const stopResponding = getStopRespondingImplement(deps);

    if (chatActionLockService.globalAction.getIsLock('clearHistory')) {
      return;
    }
    chatActionLockService.globalAction.lock('clearHistory', null);

    try {
      eventCallback?.onClearHistoryBefore?.();
      await lifeCycleService.command.onBeforeClearHistory();
      fileManager.emit(FileManagerEventNames.CANCEL_UPLOAD_FILE);

      /**
       * 请注意，这里的顺序一定是先调用 break_message 接口，然后再调用 clear_history 接口
       * 顺序不能变，否则接口会报错
       */
      await stopResponding();
      const res = await chatCore.clearHistory();

      unselectAll();
      clearMessage();
      clearSuggestions();

      const newSectionId = res?.new_section_id;

      if (!newSectionId) {
        throw new Error('clear history got no section id');
      }
      setLatestSectionId(res.new_section_id);
      reporter.successEvent({ eventName: ReportEventNames.ClearHistory });
    } catch (e) {
      reporter.errorEvent({
        eventName: ReportEventNames.ClearHistory,
        ...getReportError(e),
      });
    } finally {
      chatActionLockService.globalAction.unlock('clearHistory');
      loadMoreClient.onClearHistory();
      eventCallback?.onClearHistoryAfter?.();
      await lifeCycleService.command.onAfterClearHistory();
    }
  };
