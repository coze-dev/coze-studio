import { useIsSendMessageLock } from '../public/use-is-send-message-lock';
import { useMethodCommonDeps } from '../context/use-method-common-deps';
import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { stopResponding } from '../../utils/stop-responding';
import { WaitingPhase } from '../../store/waiting';
import { type MethodCommonDeps } from '../../plugin/types';
import { usePreference } from '../../context/preference';

export const useCouldSendNewMessage = (): boolean => {
  const { newMessageInterruptScenario } = usePreference();
  const { useWaitingStore, useBatchFileUploadStore } = useChatAreaStoreSet();

  const isSendMessageLock = useIsSendMessageLock();

  const hasFileNotSuccess = useBatchFileUploadStore(state =>
    state.hasFileNotSuccess(),
  );
  const baseCouldSendMessage = useWaitingStore(state => {
    const { waiting, sending } = state;
    if (!waiting && !sending) {
      return true;
    }
    switch (newMessageInterruptScenario) {
      case 'replying':
        return !sending;
      case 'suggesting':
        return waiting?.phase === WaitingPhase.Suggestion;
      case 'never':
        return false;
      default:
        throw new Error(
          `unexpected interrupt Scenario: ${newMessageInterruptScenario}`,
        );
    }
  });

  return baseCouldSendMessage && !isSendMessageLock && !hasFileNotSuccess;
};

export const useStopResponding = () => {
  const deps = useMethodCommonDeps();
  return getStopRespondingImplement(deps);
};

export const getStopRespondingImplement = (deps: MethodCommonDeps) => () => {
  const { context, storeSet } = deps;
  return stopResponding({
    ...context,
    storeSet,
  });
};
