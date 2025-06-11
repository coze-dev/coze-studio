import { injectable } from 'inversify';

export enum ContextKey {
  /**
   *
   */
  editorFocus = 'editorFocus',
}

export const ContextMatcher = Symbol('ContextMatcher');

export interface ContextMatcher {
  /**
   * 判断 expression 是否命中上下文
   */
  match: (expression: string) => boolean;
}

/**
 * 全局 context key 上下文管理
 */
@injectable()
export class ContextKeyService implements ContextMatcher {
  private _contextKeys: Map<string, unknown> = new Map();

  public constructor() {
    // TODO: 测试用，这里之后要接入 view
    this._contextKeys.set(ContextKey.editorFocus, true);
  }

  public setContext(key: string, value: unknown): void {
    this._contextKeys.set(key, value);
  }

  public getContext<T>(key: string): T {
    return this._contextKeys.get(key) as T;
  }

  public match(expression: string): boolean {
    const keys = Array.from(this._contextKeys.keys());
    const func = new Function(...keys, `return ${expression};`);
    const res = func(...keys.map(k => this._contextKeys.get(k)));

    return res;
  }
}
