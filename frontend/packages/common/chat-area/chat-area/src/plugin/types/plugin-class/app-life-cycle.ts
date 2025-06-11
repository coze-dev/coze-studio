import { type getMessageIndexStoreWriteableMethods } from '../../plugin-context/store-writeable-methods/message-index-store';
import { type MixInitResponse } from '../../../context/chat-area-context/type';

export interface OnAfterCallback {
  messageIndexStore: ReturnType<typeof getMessageIndexStoreWriteableMethods>;
}
export interface OnAfterInitialContext {
  messageListFromService: MixInitResponse;
}

export interface OnRefreshMessageListError {
  error: unknown;
}
