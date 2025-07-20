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
 
import {
  logger,
  reporter,
  type Logger,
  type Reporter,
} from '@coze-arch/logger';

import { getSlardarEnv } from '../shared/utils/env';
import { type DeployVersion, type ENV } from '../shared/const';
import { slardarInstance, createSlardarConfig } from './slardar';
import { LogOptionsHelper } from './log-options-helper';

// 获取 ReportLog 类的实例类型
type ReportLogInstance = InstanceType<typeof ReportLog>;

// 获取 slardarTracer 方法的返回类型
type SlardarTracerReturnType = ReturnType<ReportLogInstance['slardarTracer']>;

// 获取 trace 方法的类型
export type Tracer = SlardarTracerReturnType['trace'];

export type ReportLogType = 'error' | 'info';
/**
 * 日志上报
 */

export interface ReportLogProps {
  // 后面等级上报，包含前面等级日志
  logLevel?: 'disable' | 'error' | 'info';
  env?: ENV;
  namespace?: string;
  scope?: string;
  meta?: Record<string, unknown>;
  deployVersion?: DeployVersion;
}

const defaultReportLogProps: {
  env: ENV;
  logLevel: 'disable' | 'error' | 'info';
  deployVersion: DeployVersion;
} = {
  env: 'production',
  deployVersion: 'release',
  logLevel: 'error',
};

/**
 * namespace不可覆盖
 */
const unChangeProps = {
  namespace: 'chat-core',
  meta: {},
};

export class ReportLog {
  ctx: LogOptionsHelper<ReportLogProps>;

  private hasSlardarInitd = false;

  private loggerWithBaseInfo!: Logger;

  private reportLogWithBaseInfo!: Reporter;

  constructor(props?: ReportLogProps) {
    const options = LogOptionsHelper.merge(props || {}, unChangeProps);
    this.ctx = new LogOptionsHelper(options);
    this.initLog(options);
    this.initReport(options);
  }

  /**
   * 实例初始化，所有 scope 也只初始化一次
   */
  init() {
    console.log('debugger slardar instance init', this.hasSlardarInitd);
    if (this.hasSlardarInitd) {
      return;
    }
    this.hasSlardarInitd = true;
    const options = this.ctx.get();
    slardarInstance.init(
      createSlardarConfig({
        env: getSlardarEnv({
          env: options?.env || defaultReportLogProps.env,
          deployVersion:
            options?.deployVersion || defaultReportLogProps.deployVersion,
        }),
      }),
    );
    slardarInstance.start();
  }

  createLoggerWith(options?: ReportLogProps) {
    return new ReportLog(this.resolveCloneParams(options || {}));
  }

  private resolveCloneParams(props: ReportLogProps) {
    return LogOptionsHelper.merge(this.ctx.get(), props);
  }

  /**
   * slardar 初始化
   */
  private initReport(options?: ReportLogProps) {
    this.reportLogWithBaseInfo = reporter.createReporterWithPreset(
      this.resolveCloneParams(options || {}),
    );
    this.reportLogWithBaseInfo.init(slardarInstance);
  }

  /**
   *  控制台日志初始化
   * @param options
   */
  private initLog(options?: ReportLogProps) {
    this.loggerWithBaseInfo = logger.createLoggerWith({
      ctx: this.resolveCloneParams(options || {}),
    });
  }

  // 判断是否需要上报
  private isNeedReport(logType: ReportLogType) {
    const { logLevel } = this.ctx.get();
    if (logLevel === 'disable') {
      return false;
    }
    if (logLevel === 'error') {
      return logType === 'error';
    }
    return true;
  }

  info(...args: Parameters<typeof logger.info>) {
    if (!this.isNeedReport('info')) {
      return;
    }
    this.loggerWithBaseInfo.info(...args);
  }

  error(...args: Parameters<typeof logger.error>) {
    if (!this.isNeedReport('error')) {
      return;
    }
    this.loggerWithBaseInfo.error(...args);
  }

  /**
   * slardar日志 info层级
   */
  slardarInfo(...args: Parameters<typeof reporter.info>) {
    this.reportLogWithBaseInfo.info(...args);
  }

  /**
   * slardar日志 success级别
   * @param args
   */
  slardarSuccess(...args: Parameters<typeof reporter.success>) {
    this.reportLogWithBaseInfo.success(...args);
  }

  /**
   * slardar日志, error级别
   */
  slardarError(...args: Parameters<typeof reporter.error>) {
    this.reportLogWithBaseInfo.error(...args);
  }

  /**
   * slardar 自定义事件，用于事件统计
   */
  slardarEvent(...args: Parameters<typeof reporter.event>) {
    this.reportLogWithBaseInfo.event(...args);
  }

  /**
   * slardar 自定义成功事件，用于事件统计
   */
  slardarSuccessEvent(...args: Parameters<typeof reporter.event>) {
    this.reportLogWithBaseInfo.successEvent(...args);
  }

  /**
   * slardar 自定义错误事件，用于事件统计, 有错误堆栈信息
   */
  slardarErrorEvent(...args: Parameters<typeof reporter.errorEvent>) {
    this.reportLogWithBaseInfo.errorEvent(...args);
  }

  /**
   * 事件追踪, 用于链路性能统计
   */
  slardarTracer(...args: Parameters<typeof reporter.tracer>) {
    return this.reportLogWithBaseInfo.tracer(...args);
  }
}
