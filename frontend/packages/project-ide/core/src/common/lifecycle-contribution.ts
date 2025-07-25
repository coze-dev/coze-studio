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
 
/* eslint-disable @typescript-eslint/method-signature-style */
import { type MaybePromise } from '@flowgram-adapter/common';

export const LifecycleContribution = Symbol('LifecycleContribution');
/**
 * IDE 全局生命周期注册
 */
export interface LifecycleContribution {
  /**
   * IDE 注册阶段
   */
  onInit?(): void;
  /**
   * IDE loading 阶段, 一般用于加载全局配置，如 i18n 数据
   */
  onLoading?(): MaybePromise<void>;
  /**
   * IDE 布局初始化阶段，在 onLoading 之后执行
   */
  onLayoutInit?(): MaybePromise<void>;
  /**
   * IDE 开始执行, 可以加载业务逻辑
   */
  onStart?(): MaybePromise<void>;
  /**
   * 在浏览器 `beforeunload` 之前执行，如果返回true，则会阻止
   */
  onWillDispose?(): boolean | void;
  /**
   * IDE 销毁
   */
  onDispose?(): void;
}
