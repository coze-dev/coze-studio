import { type LoadAction } from '../../store/message-index';
import { type LoadMoreEnvTools } from './load-more-env-tools';

export type LoadCommandEnvTools = Omit<
  LoadMoreEnvTools,
  'triggerChatListShowUp' | 'injectChatCore' | 'injectGetScrollController'
>;

export abstract class LoadCommand {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract load(): Promise<void>;
  abstract action: LoadAction | null;
}

export abstract class LoadEffect {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract run(): void;
}

export abstract class LoadAsyncEffect {
  constructor(protected envTools: LoadCommandEnvTools) {}

  abstract runAsync(): Promise<void>;
}
