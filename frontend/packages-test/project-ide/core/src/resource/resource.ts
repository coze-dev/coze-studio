import {
  type Disposable,
  type MaybePromise,
  type Event,
} from '@flowgram-adapter/common';

import { type URI, type URIHandler } from '../common';

export interface ResourceInfo {
  displayName?: string; // 显示标题
  lastModification?: number | string; // 最后修改时间
  version?: number | string;
}
export interface Resource<T = any, INFO extends ResourceInfo = ResourceInfo>
  extends Disposable {
  readonly uri: URI;
  getInfo: () => MaybePromise<INFO>;
  updateInfo: (info: INFO) => void;
  readContent: () => MaybePromise<T>;
  saveContent: (content: T) => MaybePromise<void>;
  onInfoChange: Event<INFO>;
  onContentChange: Event<T>;
  onDispose: Event<void>;
}

export class ResourceError extends Error {
  static NotFound = -40000;

  static OutOfSync = -40001;

  static is(error: object | undefined, code: number): error is ResourceError {
    return error instanceof ResourceError && error.code === code;
  }

  constructor(
    readonly message: string,
    readonly code: number,
    readonly uri: URI,
  ) {
    super(message);
  }
}

export const ResourceHandler = Symbol('ResourceHandler');

export interface ResourceHandler<T extends Resource = Resource>
  extends URIHandler {
  /**
   * 创建资源
   * @param uri
   */
  resolve: (uri: URI) => T;
}
