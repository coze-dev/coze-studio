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
 
import { type StoreApi, type UseBoundStore } from 'zustand';

import {
  type AutosaveObserverConfig,
  type HostedObserverConfig,
  type EventCallBacks,
  type SaveRequest,
} from '../type';
import { AutosaveObserver } from './observer';

export interface AutosaveManagerProps<StoreType, ScopeKey, ScopeStateType> {
  store: UseBoundStore<StoreApi<StoreType>>;
  registers: HostedObserverConfig<StoreType, ScopeKey, ScopeStateType>[];
  saveRequest: SaveRequest<ScopeStateType, ScopeKey>;
  eventCallBacks?: EventCallBacks<ScopeStateType, ScopeKey>;
}

export class AutosaveManager<StoreType, ScopeKey, ScopeStateType> {
  private configList: AutosaveObserverConfig<
    StoreType,
    ScopeKey,
    ScopeStateType
  >[];
  private observerList: AutosaveObserver<StoreType, ScopeKey, ScopeStateType>[];
  private store: UseBoundStore<StoreApi<StoreType>>;

  private eventCallBacks?: EventCallBacks<ScopeStateType, ScopeKey>;
  private saveRequest: SaveRequest<ScopeStateType, ScopeKey>;

  constructor(
    props: AutosaveManagerProps<StoreType, ScopeKey, ScopeStateType>,
  ) {
    this.configList = [];
    this.observerList = [];
    this.saveRequest = props.saveRequest;
    this.eventCallBacks = props.eventCallBacks;
    this.store = props.store;

    this.register(props.registers);
  }

  /**
   * 注册数据源和定义对应的 Observer 配置
   * @param _config
   */
  public register = (
    registers: HostedObserverConfig<StoreType, ScopeKey, ScopeStateType>[],
  ) => {
    this.close();
    this.configList = [];

    registers.forEach(register => {
      const config: AutosaveObserverConfig<
        StoreType,
        ScopeKey,
        ScopeStateType
      > = {
        ...register,
        eventCallBacks: this.eventCallBacks,
        saveRequest: this.saveRequest,
      };
      this.configList.push(config);
    });
  };

  /**
   * 启动 Manager 模块
   */
  public start = () => {
    if (this.observerList.length > 0) {
      return;
    }
    this.observerList = this.configList.map(
      config =>
        new AutosaveObserver({
          store: this.store,
          ...config,
        }),
    );
  };

  /**
   * 关闭 Manager 模块下的所有属性监听
   */
  public close = () => {
    this.observerList.forEach(observer => observer.close());
    this.observerList = [];
  };

  /**
   * 手动保存
   * @param params
   */
  public manualSave = async (key: ScopeKey, params: ScopeStateType) => {
    const config = this.getConfig(key);
    if (!config) {
      return;
    }
    const { middleware, eventCallBacks, saveRequest } = config;
    const beforeSavePayload = middleware?.onBeforeSave
      ? await middleware?.onBeforeSave(params)
      : params;
    eventCallBacks?.onBeforeSave?.(beforeSavePayload);

    await saveRequest(beforeSavePayload as ScopeStateType, key, []);

    const afterSavePayload = middleware?.onAfterSave
      ? await middleware?.onAfterSave(params)
      : params;
    eventCallBacks?.onAfterSave?.(afterSavePayload);
  };

  /**
   * 回调过程中关闭自动保存
   * @param params
   */
  public handleWithoutAutosave = async (params: {
    key: ScopeKey;
    handler: () => Promise<void>;
  }) => {
    const { key, handler } = params;

    const observers = this.observerList.filter(o => o.config.key === key);
    if (observers.length) {
      observers.forEach(o => (o.lock = true));
      await handler();
      observers.forEach(o => (o.lock = false));
    }
  };

  /**
   * 立即触发保存
   * @param key
   */
  public saveFlush = (key: ScopeKey) => {
    const observer = this.getObserver(key);
    observer?.debouncedSaveFunc?.flush?.();
  };

  /**
   * 立即触发所有保存
   * @param key
   */
  public saveFlushAll = () => {
    this.observerList.forEach(observer =>
      observer?.debouncedSaveFunc?.flush?.(),
    );
  };

  /**
   * 获取目标 observer 配置
   * @param key
   */
  private getObserver = (key: ScopeKey) =>
    this.observerList.find(i => i.config.key === key);

  /**
   * 获取目标配置项
   * @param key
   */
  private getConfig = (key: ScopeKey) =>
    this.configList.find(i => i.key === key);
}
