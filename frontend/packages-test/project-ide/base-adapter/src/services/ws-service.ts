import { inject, injectable } from 'inversify';
import { Emitter } from '@coze-project-ide/client';
import { type WsMessageProps } from '@coze-project-ide/base-interface';

import { OptionsService } from './options-service';

export const safeParseEvent = (payload: string) => {
  try {
    return JSON.parse(payload);
  } catch (e) {
    console.warn('parse app cmd payload error', e);
    return undefined;
  }
};

@injectable()
export class WsService {
  @inject(OptionsService) options: OptionsService;

  protected onMessageSendEmitter = new Emitter<WsMessageProps>();
  onMessageSend = this.onMessageSendEmitter.event;

  send(data: any) {
    return;
  }

  init() {
    return;
  }

  onDispose() {
    return;
  }
}
