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
 
import { type ReportLog, type Tracer } from '../../report-log';
import type { ChatCoreError } from '../../custom-error';

/**
 * 承接所有 sdk 的 slardar 自定义事件
 */
export enum SlardarEvents {
  // sdk初始化，用于数据统计
  SDK_INIT = 'chat_sdk_init',
  // 上传失败
  SDK_MESSAGE_UPLOAD_FAIL = 'chat_sdk_message_upload_fail',
  // 打断消息
  SDK_BREAK_MESSAGE = 'chat_sdk_break_message',
  // 消息发送链路监控
  SDK_MESSAGE_SEND_TRACER = 'chat_sdk_message_send_tracer',
  // 拉流链路耗时监控
  SDK_PULL_STREAM_TRACER = 'chat_sdk_pull_stream_tracer',
}

/**
 * slardar事件追踪
 */
export class ReportEventsTracer {
  private reporter: ReportLog;

  private eventTracers = new Map<
    string,
    {
      trace: Tracer;
      meta?: Record<string, unknown>;
    }
  >();

  constructor(reporter: ReportLog) {
    this.reporter = reporter;
  }

  /**
   * 消息发送事件追踪
   */
  sendMessageTracer = {
    start: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.createTracer(
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
      this.setTracer(local_message_id, SlardarEvents.SDK_MESSAGE_SEND_TRACER, {
        trace,
      });
      trace?.('start', {
        meta,
      });
    },
    success: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
      trace?.('success', {
        meta,
      });
      this.deleteTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
    },
    error: (chatCoreError: ChatCoreError) => {
      const { local_message_id } = chatCoreError.ext;
      if (!local_message_id) {
        return;
      }
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
      trace?.('error', {
        meta: chatCoreError.flatten(),
        error: chatCoreError,
      });
      this.deleteTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
    },
    timeout: (local_message_id: string) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
      trace?.('timeout');
      this.deleteTracer(
        local_message_id,
        SlardarEvents.SDK_MESSAGE_SEND_TRACER,
      );
    },
  };

  /*
   * 拉取流事件追踪
   */
  pullStreamTracer = {
    start: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.createTracer(SlardarEvents.SDK_PULL_STREAM_TRACER);
      this.setTracer(local_message_id, SlardarEvents.SDK_PULL_STREAM_TRACER, {
        trace,
        meta,
      });
      trace?.('start', {
        meta,
      });
    },
    success: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      trace?.('success', {
        meta,
      });
      this.deleteTracer(local_message_id, SlardarEvents.SDK_PULL_STREAM_TRACER);
    },
    break: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      // 打断算成功
      trace?.('success', {
        meta,
      });
      this.deleteTracer(local_message_id, SlardarEvents.SDK_PULL_STREAM_TRACER);
    },
    error: (chatCoreError: ChatCoreError, meta?: Record<string, unknown>) => {
      const { local_message_id } = chatCoreError.ext;
      if (!local_message_id) {
        return;
      }
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      trace?.('error', {
        meta: {
          ...chatCoreError.flatten(),
          ...meta,
        },
        error: chatCoreError,
      });
      this.deleteTracer(local_message_id, SlardarEvents.SDK_PULL_STREAM_TRACER);
    },
    timeout: (chatCoreError: ChatCoreError) => {
      const { local_message_id } = chatCoreError.ext;
      if (!local_message_id) {
        return;
      }
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      trace?.('timeout', {
        meta: chatCoreError.flatten(),
        error: chatCoreError,
      });
      this.deleteTracer(local_message_id, SlardarEvents.SDK_PULL_STREAM_TRACER);
    },
    receiveAck: (local_message_id: string, meta?: Record<string, unknown>) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      trace?.('ack', {
        meta,
      });
    },
    receiveFirstAnsChunk: (
      local_message_id: string,
      meta?: Record<string, unknown>,
    ) => {
      const { trace } = this.getTracer(
        local_message_id,
        SlardarEvents.SDK_PULL_STREAM_TRACER,
      );
      trace?.('first_ans_chunk', {
        meta,
      });
    },
  };

  /**
   * 组装获取唯一key
   */
  static getUniqueKey(local_message_id: string, event: SlardarEvents): string {
    return `${local_message_id}_${event}`;
  }

  /**
   * 根据local_message_id、event获取trace
   */
  getTracer(local_message_id: string, event: SlardarEvents) {
    return (
      this.eventTracers.get(
        ReportEventsTracer.getUniqueKey(local_message_id, event),
      ) || {
        trace: undefined,
      }
    );
  }

  /**
   * 根据local_message_id、event新增trace
   */
  setTracer(
    local_message_id: string,
    event: SlardarEvents,
    traceInfo: {
      trace: Tracer;
      meta?: Record<string, unknown>;
    },
  ) {
    const { trace, meta } = traceInfo;
    this.eventTracers.set(
      ReportEventsTracer.getUniqueKey(local_message_id, event),
      {
        trace,
        meta,
      },
    );
  }

  /**
   * 删除trace
   */
  deleteTracer(local_message_id: string, event: SlardarEvents) {
    this.eventTracers.delete(
      ReportEventsTracer.getUniqueKey(local_message_id, event),
    );
  }

  /**
   * 创建trace
   */
  createTracer(eventName: SlardarEvents) {
    return this.reporter.slardarTracer({
      eventName,
    });
  }
}
