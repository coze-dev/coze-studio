import {
  isRequireInfoInterruptMessage,
  type OnMessageBoxRenderContext,
  WriteableRenderLifeCycleService,
} from '@coze-common/chat-area';

import { InterruptMessageBox } from '../custom-components/interrupt-message';

export class ResumeRenderLifeCycleService extends WriteableRenderLifeCycleService<unknown> {
  onMessageBoxRender(ctx: OnMessageBoxRenderContext) {
    const { message } = ctx;

    if (isRequireInfoInterruptMessage(message)) {
      return {
        ...ctx,
        MessageBox: InterruptMessageBox,
      };
    }

    return ctx;
  }
}
