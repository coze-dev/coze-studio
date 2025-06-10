import { named, injectable, inject } from 'inversify';
import {
  ContributionProvider,
  type MaybePromise,
  Emitter,
  Disposable,
  type Event,
} from '@flowgram-adapter/common';

import { type URI } from './uri';
import { prioritizeAll } from './prioritizeable';

export interface OpenerOptions {}

export const OpenHandler = Symbol('OpenHandler');
/**
 * `OpenHandler` should be implemented to provide a new opener.
 */
export interface OpenHandler {
  /**
   * Test whether this handler can open the given URI for given options.
   * Return a nonzero number if this handler can open; otherwise it cannot.
   * Never reject.
   *
   * A returned value indicating a priority of this handler.
   */
  canHandle: (uri: URI, options?: OpenerOptions) => MaybePromise<number>;
  /**
   * Open a widget for the given URI and options.
   * Resolve to an opened widget or undefined, e.g. if a page is opened.
   * Never reject if `canHandle` return a positive number; otherwise should reject.
   */
  open: (uri: URI, options?: OpenerOptions) => MaybePromise<object | undefined>;
}

export const OpenerService = Symbol('OpenerService');
/**
 * `OpenerService` provide an access to existing openers.
 */
export interface OpenerService {
  /**
   * 跳转定位
   * @param uri
   * @param options
   */
  open: (uri: URI, options?: OpenerOptions) => Promise<object | undefined>;

  /**
   * 某个请求触发
   */
  onURIOpen: Event<{ uri: URI; options?: OpenerOptions }>;
}

@injectable()
export class DefaultOpenerService implements OpenerService {
  // Collection of open-handlers for custom-editor contributions.
  protected readonly customEditorOpenHandlers: OpenHandler[] = [];

  protected readonly onDidChangeOpenersEmitter = new Emitter<void>();

  protected readonly onURIOpenEmitter = new Emitter<{
    uri: URI;
    options?: OpenerOptions;
  }>();

  readonly onDidChangeOpeners = this.onDidChangeOpenersEmitter.event;

  readonly onURIOpen = this.onURIOpenEmitter.event;

  constructor(
    @inject(ContributionProvider)
    @named(OpenHandler)
    protected readonly handlersProvider: ContributionProvider<OpenHandler>,
  ) {}

  async open(uri: URI, options?: OpenerOptions): Promise<object | undefined> {
    const opener = await this.getOpener(uri, options);
    const result = await opener.open(uri, options);
    this.onURIOpenEmitter.fire({ uri, options });
    return result;
  }

  addHandler(openHandler: OpenHandler): Disposable {
    this.customEditorOpenHandlers.push(openHandler);
    this.onDidChangeOpenersEmitter.fire();

    return Disposable.create(() => {
      this.customEditorOpenHandlers.splice(
        this.customEditorOpenHandlers.indexOf(openHandler),
        1,
      );
      this.onDidChangeOpenersEmitter.fire();
    });
  }

  async getOpener(uri: URI, options?: OpenerOptions): Promise<OpenHandler> {
    const handlers = await this.prioritize(uri, options);
    if (handlers.length >= 1) {
      return handlers[0];
    }
    return Promise.reject(new Error(`There is no opener for ${uri}.`));
  }

  async getOpeners(uri?: URI, options?: OpenerOptions): Promise<OpenHandler[]> {
    return uri ? this.prioritize(uri, options) : this.getHandlers();
  }

  protected async prioritize(
    uri: URI,
    options?: OpenerOptions,
  ): Promise<OpenHandler[]> {
    const prioritized = await prioritizeAll<any>(
      this.getHandlers(),
      async (handler: any) => {
        try {
          return await handler.canHandle(uri, options);
        } catch {
          return 0;
        }
      },
    );
    return prioritized.map((p: any) => p.value) as OpenHandler[];
  }

  protected getHandlers(): OpenHandler[] {
    return [
      ...this.handlersProvider.getContributions(),
      ...this.customEditorOpenHandlers,
    ];
  }
}
