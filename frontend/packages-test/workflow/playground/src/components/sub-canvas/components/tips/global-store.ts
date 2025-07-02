/* eslint-disable @typescript-eslint/naming-convention -- no need */

const STORAGE_KEY = 'workflow-move-into-sub-canvas-tip-visible';
const STORAGE_VALUE = 'false';

export class TipsGlobalStore {
  private static _instance?: TipsGlobalStore;
  public static get instance(): TipsGlobalStore {
    if (!this._instance) {
      this._instance = new TipsGlobalStore();
    }
    return this._instance;
  }

  private closed = false;

  public isClosed(): boolean {
    return this.isCloseForever() || this.closed;
  }

  public close(): void {
    this.closed = true;
  }

  public isCloseForever(): boolean {
    return localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE;
  }

  public closeForever(): void {
    localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
  }
}
