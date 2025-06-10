import { type ParseEvent } from 'eventsource-parser';

export enum FetchStreamErrorCode {
  FetchException = 10001,
  HttpChunkStreamingException = 10002,
}

export interface FetchStreamErrorInfo {
  code: FetchStreamErrorCode | number;
  msg: string;
}

export interface FetchStreamError extends FetchStreamErrorInfo {
  error: unknown;
}

export type ValidateResult =
  | {
      status: 'success';
    }
  | {
      status: 'error';
      error: Error;
    };

/**
 * {@link RequestInfo} 与 {@link RequestInit} 是 Fetch 原有参数类型
 */

export interface FetchSteamConfig<Message = ParseEvent, DataClump = unknown>
  extends RequestInit {
  /**
   *  当开始 fetch时调用
   */
  onFetchStart?: (params?: DataClump) => void;

  /**
   * 当 fetch 返回 response 时调用此方法。使用这个方法来验证 Response 是否符合预期，当不符合预期时抛出错误
   * 无论是否提供此方法，会自动校验 Response.ok 标志位与 Response.body 是否存在
   */
  onStart?: (response: Response) => Promise<void>;

  /**
   *  当 fetch 成功返回 response 并且 onStart 成功后触发此回调
   */
  onFetchSuccess?: (params?: DataClump) => void;

  /**
   * 开始读取 ReadableStream 时触发此回调。onFetchSuccess 后紧接着会触发这个回调
   */
  onStartReadStream?: (params?: DataClump) => void;

  /**
   * 流式过程中解析服务端返回的 chunk 数据，返回值符合 {@link Message} 类型时，预期将在后续 {@link onMessage} 方法中响应
   * 可在解析过程中进行中断或抛出错误，抛出错误同时会中断整个流式解析
   * 如果不提供则由 onMessage 直接响应 chunk 数据
   */
  streamParser?: (
    parseEvent: ParseEvent,
    method: {
      /**
       * 中止当前流式读取行为
       */
      terminate: () => void;
      /**
       * @deprecated
       * 抛出错误，同时中止当前流式读取行为，如果流中还有正常数据未被读取，也会被一起终止掉
       */
      onParseError: (error: FetchStreamErrorInfo) => void;
    },
  ) => Message | undefined;

  /**
   * 在 onMessage 回调之前执行。对业务错误的处理和抛出推荐在这个回调处理
   */
  validateMessage?: (params: {
    message: Message;
    dataClump?: DataClump;
  }) => ValidateResult;

  /**
   * 接收到服务端 Chunk 数据并经过 parse（如果有）后，如果过程中无异常则调用此方法
   */
  onMessage?: (params: { message: Message; dataClump?: DataClump }) => void;

  /**
   * 当 fetchStream resolve 时调用此方法
   */
  onAllSuccess?: (params?: DataClump) => void;

  /**
   * fetchStream 整个过程中出现任意错误会调用此方法，包括 fetch / 流式处理 chunk / response 非法等
   * 不会自动重试
   */
  onError?: (params: {
    fetchStreamError: FetchStreamError;
    dataClump?: DataClump;
  }) => void;

  /** Fetch 方法，默认为 window.fetch */
  fetch?: typeof fetch;

  /**
   * {@link https://book-refactoring2.ifmicro.com/docs/ch3.html#310-%E6%95%B0%E6%8D%AE%E6%B3%A5%E5%9B%A2%EF%BC%88data-clumps%EF%BC%89}
   * 如果你想为每个 fetchStream 维护一些业务数据、状态，推荐在此处传入抽象后的数据实例。它们会在每个回调函数中出现
   */
  dataClump?: DataClump;

  /**
   * fetch stream 整个过程的超时时长, 单位: ms。缺省或者传入 0 代表不开启定时器
   */
  totalFetchTimeout?: number;

  /**
   * 当设置了 totalFetchTimeout, 并且到期时触发此回调。除此外不会有其余副作用，例如：abort 请求。请调用方根据需要自行处理
   */
  onTotalFetchTimeout?: (params?: DataClump) => void;

  /**
   * chunk 之间超时时长, 处理 stream 过程中, 从收到上一个 chunk 开始计时, 收到下一个 chunk 时清除定时并重新计时
   * 缺省或者传入 0 代表不开启定时器, 单位: ms
   */
  betweenChunkTimeout?: number;

  /**
   * 当设置了 chunkTimeout，并且定时器到期时触发此回调。除此外不会有其余副作用，例如：abort 请求。请调用方根据需要自行处理
   */
  onBetweenChunkTimeout?: (params?: DataClump) => void;
}
