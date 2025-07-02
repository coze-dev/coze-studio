import { createContext } from 'react';

import { type StoreSet } from '../chat-area-context/type';
import { type NullableType } from '../../typing/util-types';

type NullableStoreSetContextType = NullableType<StoreSet>;

export const StoreSetContext = createContext<NullableStoreSetContextType>({
  useBatchFileUploadStore: null,
  useChatActionStore: null,
  useFileStore: null,
  useGlobalInitStore: null,
  useMessageIndexStore: null,
  useMessageMetaStore: null,
  useMessagesStore: null,
  useOnboardingStore: null,
  usePluginStore: null,
  useSectionIdStore: null,
  useSelectionStore: null,
  useSenderInfoStore: null,
  useSuggestionsStore: null,
  useWaitingStore: null,
  useAudioUIStore: null,
});
