import { injectable } from 'inversify';
import { Emitter, type Event } from '@coze-project-ide/client';

@injectable()
export class ErrorService {
  private readonly onErrorEmitter = new Emitter<void>();
  readonly onError: Event<void> = this.onErrorEmitter.event;

  toErrorPage() {
    this.onErrorEmitter.fire();
  }
}
