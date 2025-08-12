/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { injectable, inject } from 'inversify';
import {
  type CancellationToken,
  CancellationTokenSource,
  Disposable,
  DisposableCollection,
  Emitter,
  type MaybePromise,
  PromiseDeferred,
} from '@flowgram-adapter/common';

import { type URI } from '../common';
import { distinctUntilChangedFromEvent } from './utils';
import { type Resource, ResourceError, type ResourceInfo } from './resource';

export const AutoSaveResourceOptions = Symbol('AutoSaveResourceOptions');
export interface AutoSaveResourceOptions {
  uri: URI;
}
/**
 * Resource file auto-save service, currently only available for text files
 */
@injectable()
export abstract class AutoSaveResource<
  CHANGE_SET = string,
  INFO extends ResourceInfo = ResourceInfo,
> implements Disposable, Resource<CHANGE_SET, INFO>
{
  readonly autoSave: 'on' | 'off' = 'on';

  autoSaveDelay = 2000;

  info: INFO = {
    version: -1,
    lastModification: -1,
    displayName: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  private _dirty = false;

  protected readonly onPreSaveContentEmitter = new Emitter<CHANGE_SET>();

  readonly toDispose = new DisposableCollection();

  protected readonly onDirtyChangeEmitter = new Emitter<void>();

  protected readonly onValidChangeEmitter = new Emitter<void>();

  protected readonly onContentChangeEmitter = new Emitter<CHANGE_SET>();

  protected readonly onInfoChangeEmitter = new Emitter<INFO>();

  protected readonly onDisplayNameChangeEmitter = distinctUntilChangedFromEvent(
    this.onInfoChangeEmitter,
    _info => _info.displayName,
  );

  public onErrorEmitter = new Emitter<Error>();

  protected readonly contentChanges: CHANGE_SET[] = [];

  lastContent?: CHANGE_SET;

  protected readonly toDisposeOnAutoSave = new DisposableCollection();

  readonly onDirtyChange = this.onDirtyChangeEmitter.event;

  readonly onPreSaveContent = this.onPreSaveContentEmitter.event;

  readonly onValidChange = this.onValidChangeEmitter.event;

  readonly onInfoChange = this.onInfoChangeEmitter.event;

  readonly onContentChange = this.onContentChangeEmitter.event;

  readonly onDisplayNameChange = this.onDisplayNameChangeEmitter.event;

  readonly onError = this.onErrorEmitter.event;

  protected _valid = false;

  constructor(
    @inject(AutoSaveResourceOptions) readonly options: AutoSaveResourceOptions,
  ) {
    this.options = options;
    this.toDispose.push(this.toDisposeOnAutoSave);
    this.toDispose.push(this.onDirtyChangeEmitter);
    this.toDispose.push(this.onInfoChangeEmitter);
    this.toDispose.push(this.onValidChangeEmitter);
    this.toDispose.push(this.onPreSaveContentEmitter);
    this.toDispose.push(this.onContentChangeEmitter);
    this.toDispose.push(this.onDisplayNameChangeEmitter);
    this.toDispose.push(this.onErrorEmitter);
    this.toDispose.push(Disposable.create(() => this.cancelSave()));
    this.toDispose.push(Disposable.create(() => this.cancelSync()));
  }

  protected saveCancellationTokenSource = new CancellationTokenSource();

  protected cancelSave(): CancellationToken {
    this.saveCancellationTokenSource.cancel();
    this.saveCancellationTokenSource = new CancellationTokenSource();
    return this.saveCancellationTokenSource.token;
  }

  protected setDirty(dirty: boolean): void {
    if (dirty === this._dirty) {
      return;
    }
    this._dirty = dirty;
    if (!dirty) {
      // todo update version
    }
    this.onDirtyChangeEmitter.fire(undefined);
  }

  protected markAsDirty(): void {
    this.setDirty(true);
    this.doAutoSave();
  }

  protected syncCancellationTokenSource = new CancellationTokenSource();

  protected cancelSync(): CancellationToken {
    this.syncCancellationTokenSource.cancel();
    this.syncCancellationTokenSource = new CancellationTokenSource();
    return this.syncCancellationTokenSource.token;
  }

  async sync(): Promise<void> {
    const token = this.cancelSync();
    return this.run(() => this.doSync(token));
  }

  protected async doSync(token: CancellationToken): Promise<void> {
    if (token.isCancellationRequested) {
      return;
    }
    await this.readContent(false);
    // TODO sync logic needs to refresh widget data
    // if (token.isCancellationRequested || this._dirty) {
    //   return;
    // }
    // this.onContentChangeEmitter.fire(newText);
  }

  /**
   * auto save
   */
  protected doAutoSave(): void {
    if (this.autoSave === 'on') {
      const token = this.cancelSave();
      this.toDisposeOnAutoSave.dispose();
      const handle = window.setTimeout(() => {
        this.save(token);
      }, this.autoSaveDelay);
      this.toDisposeOnAutoSave.push(
        Disposable.create(() => window.clearTimeout(handle)),
      );
    }
  }

  protected pendingOperation = Promise.resolve();

  protected async run(operation: () => Promise<void>): Promise<void> {
    if (this.toDispose.disposed) {
      return;
    }
    return (this.pendingOperation = this.pendingOperation.then(async () => {
      try {
        await operation();
      } catch (e) {
        console.error(e);
      }
    }));
  }

  save(token: CancellationToken = this.cancelSave()): Promise<void> {
    return this.run(() => this._doSave(token));
  }

  private _isSaving = false;

  protected async _doSave(token: CancellationToken): Promise<void> {
    if (token.isCancellationRequested || !this._valid || this._isSaving) {
      return;
    }
    this._isSaving = true;
    try {
      const changes: CHANGE_SET[] = [...this.contentChanges];
      if (changes.length === 0) {
        return Promise.resolve(undefined);
      }
      const { version } = this.info;
      const lastChanged = changes[changes.length - 1];
      if (lastChanged === this.lastContent) {
        this.contentChanges.length = 0;
        this.setValid(true);
        this.setDirty(false);
        return;
      }
      const newInfo = await this.doSave(lastChanged, version);
      this.lastContent = lastChanged;
      this.updateInfo(newInfo);
      if (lastChanged === this.contentChanges[this.contentChanges.length - 1]) {
        this.contentChanges.length = 0;
        this.setValid(true);
        this.setDirty(false);
        this.onContentChangeEmitter.fire(lastChanged);
      } else {
        this.doAutoSave();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (ResourceError.is(e, ResourceError.OutOfSync)) {
        this.sync();
        return;
      }
      this.onErrorEmitter.fire(e);
    } finally {
      this._isSaving = false;
    }
  }

  protected setValid(valid: boolean): void {
    if (valid === this._valid) {
      return;
    }
    this._valid = valid;
    this.onValidChangeEmitter.fire();
  }

  dispose(): void {
    this.toDispose.dispose();
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get valid(): boolean {
    return this._valid;
  }

  get uri(): URI {
    return this.options.uri;
  }

  private _readContentPromise?: PromiseDeferred<CHANGE_SET>;

  async readContent(fromCache = true): Promise<CHANGE_SET> {
    try {
      if (this.lastContent !== undefined && fromCache) {
        return Promise.resolve(this.lastContent);
      }
      if (this._readContentPromise && fromCache) {
        return this._readContentPromise.promise;
      }
      const promise = new PromiseDeferred<CHANGE_SET>();
      this._readContentPromise = promise;
      const result = await this.doRead();
      this.lastContent = result.content;
      this.setValid(true);
      this.updateInfo(result.info);
      this.onContentChangeEmitter.fire(result.content);
      promise.resolve(result.content);
      this._readContentPromise = undefined;
      return result.content;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      this.setValid(false);
      this.onErrorEmitter.fire(e);
      this._readContentPromise = undefined;
      throw e;
    }
  }

  protected abstract doSave(
    content: CHANGE_SET,
    preVersion?: number | string,
  ): Promise<INFO>;

  protected abstract doRead(): Promise<{ content: CHANGE_SET; info: INFO }>;

  protected abstract doGetInfo(): MaybePromise<INFO>;

  async getInfo(fromCache = true): Promise<INFO> {
    if (fromCache && this.info.version !== -1) {
      return this.info;
    }
    const info = await this.doGetInfo();
    this.updateInfo(info);
    return info;
  }

  updateInfo(info: INFO) {
    // if (
    //   info.lastModification !== this.info.lastModification ||
    //   info.version !== this.info.version
    // ) {
    //   this.sync();
    // }
    this.info = info;
    this.onInfoChangeEmitter.fire(info);
  }

  saveContent(content: CHANGE_SET, patch = false): void {
    // If incremental changes are supported (only one layer)
    let newContent = content;
    const preSaveContent =
      this.contentChanges[this.contentChanges.length - 1] ?? this.lastContent;
    if (
      patch &&
      preSaveContent &&
      typeof preSaveContent === 'object' &&
      typeof content === 'object'
    ) {
      newContent = {
        ...preSaveContent,
        ...content,
      };
    }
    this.contentChanges.push(newContent);
    this.onPreSaveContentEmitter.fire(newContent);
    this.markAsDirty();
  }

  /**
   * Get the content being saved
   */
  getPreSaveContent(): CHANGE_SET | undefined {
    return (
      this.contentChanges[this.contentChanges.length - 1] ?? this.lastContent
    );
  }

  onDispose = this.toDispose.onDispose;
}
