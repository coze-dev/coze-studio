import { injectable, postConstruct } from 'inversify';

export const StorageService = Symbol('StorageService');

/**
 * 存储数据到缓存
 */
export interface StorageService {
  /**
   * Stores the given data under the given key.
   */
  setData: <T>(key: string, data: T) => void;

  /**
   * Returns the data stored for the given key or the provided default value if nothing is stored for the given key.
   */
  getData: (<T>(key: string, defaultValue: T) => T) &
    (<T>(key: string) => T | undefined);
}

interface LocalStorage {
  [key: string]: any;
}

@injectable()
export class LocalStorageService implements StorageService {
  private storage: LocalStorage;

  private _prefix = 'flowide:';

  setData<T>(key: string, data: T): void {
    this.storage[this.prefix(key)] = JSON.stringify(data);
  }

  getData<T>(key: string, defaultValue?: T): T {
    const result = this.storage[this.prefix(key)];
    if (result === undefined) {
      return defaultValue as any;
    }
    return JSON.parse(result);
  }

  prefix(key: string) {
    return `${this._prefix}${key}`;
  }

  setPrefix(prefix: string) {
    this._prefix = prefix;
  }

  @postConstruct()
  protected init(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = {};
    }
  }
}
