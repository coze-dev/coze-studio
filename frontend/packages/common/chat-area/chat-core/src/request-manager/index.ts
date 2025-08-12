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

import { merge } from 'lodash-es';
import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  muteMergeWithArray,
  type PartiallyRequired,
} from '../shared/utils/data-handler';
import { type ReportLog } from '../report-log';
import {
  type DefaultRequestManagerOptions,
  type RequestManagerOptions,
  type RequestScene,
  type SceneConfig,
} from './types';
import { getDefaultSceneConfig } from './request-config';

export interface RequestManagerProps {
  options?: RequestManagerOptions;
  reportLog: ReportLog;
}
export class RequestManager {
  private mergedBaseOptions: DefaultRequestManagerOptions;

  private reportLog: ReportLog;

  private reportLogWithScope: ReportLog;

  request!: AxiosInstance;

  constructor({ options, reportLog }: RequestManagerProps) {
    this.mergedBaseOptions = muteMergeWithArray(
      getDefaultSceneConfig(),
      options,
    );
    this.reportLog = reportLog;
    this.reportLogWithScope = this.reportLog.createLoggerWith({
      scope: 'RequestManager',
    });
    this.createRequest();
  }

  createRequest() {
    this.reportLogWithScope.info({
      message: 'RequestManager is initialized',
      meta: {
        ...this.mergedBaseOptions,
      },
    });
    const { baseURL, timeout, headers } = this.mergedBaseOptions;
    this.request = axios.create({
      baseURL,
      timeout,
      headers,
    });
    this.useRequestInterceptor();
    this.useResponseInterceptor();
  }

  appendRequestOptions(options: RequestManagerOptions) {
    this.mergedBaseOptions = muteMergeWithArray(
      this.mergedBaseOptions,
      options,
    );
  }

  /**
   * Incoming request hooks can be intercepted separately for each scene
   */
  private useRequestInterceptor() {
    // Execute incoming unified hooks
    const onCommonBeforeRequest = async (
      config: InternalAxiosRequestConfig,
    ) => {
      const { hooks, scenes, ...rest } = this.mergedBaseOptions;
      if (!hooks) {
        return merge(config, rest);
      }
      const { onBeforeRequest = [] } = hooks;
      for (const hook of onBeforeRequest) {
        config = await hook(config);
      }
      return merge(config, rest);
    };
    // Execute hooks for each scene
    const onSceneBeforeRequest = async (config: InternalAxiosRequestConfig) => {
      const { scenes } = this.mergedBaseOptions;
      if (!scenes) {
        return config;
      }
      const { url } = config;
      const targetScene = Object.values(scenes).find(v => v.url === url);
      if (!targetScene) {
        return config;
      }
      const { hooks, ...rest } = targetScene;
      if (!hooks) {
        return merge(config, rest);
      }
      const { onBeforeRequest = [] } = hooks;
      for (const hook of onBeforeRequest) {
        config = await hook(config);
      }

      return merge({ ...rest }, config);
    };
    this.request.interceptors.request.use(async config => {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- temporary variable, quite normal
      const _config = await onCommonBeforeRequest(config);
      return await onSceneBeforeRequest(_config);
    });
  }

  /**
   * Incoming response hooks, can be intercepted individually for each scene
   */
  private useResponseInterceptor() {
    // Execute incoming unified hooks
    const onCommonAfterResponse = async (
      response: AxiosResponse,
      hooksName: 'onAfterResponse' | 'onErrrorResponse' = 'onAfterResponse',
    ): Promise<AxiosResponse> => {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- temporary variable, quite normal
      let _response: AxiosResponse | Promise<AxiosResponse> = response;
      const { hooks } = this.mergedBaseOptions;
      if (!hooks) {
        return response;
      }
      const onAfterResponse = hooks[hooksName] || [];
      for (const hook of onAfterResponse) {
        _response = await hook(response);
      }
      return _response;
    };
    // Execute hooks for each scene
    const onSceneAfterResponse = async (
      response: AxiosResponse,
      hooksName: 'onAfterResponse' | 'onErrrorResponse' = 'onAfterResponse',
    ): Promise<AxiosResponse> => {
      const { scenes } = this.mergedBaseOptions;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- temporary variable, quite normal
      let _response: AxiosResponse | Promise<AxiosResponse> = response;
      if (!scenes) {
        return response;
      }
      const { url } = response.config;
      const targetScene = Object.values(scenes).find(v => v.url === url);
      if (!targetScene) {
        return response;
      }
      const { hooks } = targetScene;
      if (!hooks) {
        return response;
      }
      const onAfterResponse = hooks[hooksName] || [];
      for (const hook of onAfterResponse) {
        _response = await hook(response);
      }

      return _response;
    };
    this.request.interceptors.response.use(
      async response => {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- temporary variable, quite normal
        const _response = await onCommonAfterResponse(response);
        return await onSceneAfterResponse(_response);
      },
      async response => {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- temporary variable, quite normal
        const _response = await onCommonAfterResponse(
          response,
          'onErrrorResponse',
        );
        return await onSceneAfterResponse(_response, 'onErrrorResponse');
      },
    );
  }

  /**
   * Get configuration information
   */
  getSceneConfig(scene: RequestScene): PartiallyRequired<SceneConfig, 'url'> {
    const { hooks, scenes, ...rest } = this.mergedBaseOptions;
    return merge(rest, scenes[scene]);
  }
}

export const requestInstance = axios.create();
