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
  type ReadonlyLifeCycleServiceCollection,
  type WriteableLifeCycleServiceCollection,
} from '../plugin-class/life-cycle';
import {
  type ReadonlyRenderLifeCycleService,
  type WriteableRenderLifeCycleService,
} from '../../plugin-class/service/render-life-cycle-service';
import {
  type ReadonlyMessageLifeCycleService,
  type WriteableMessageLifeCycleService,
} from '../../plugin-class/service/message-life-cycle-service';
import {
  type ReadonlyCommandLifeCycleService,
  type WriteableCommandLifeCycleService,
} from '../../plugin-class/service/command-life-cycle-service';
import {
  type ReadonlyAppLifeCycleService,
  type WriteableAppLifeCycleService,
} from '../../plugin-class/service/app-life-cycle-service';
import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../../plugin-class/plugin';

export type WriteableLifeCycleServiceGenerator<T = unknown, K = unknown> = (
  plugin: WriteableChatAreaPlugin<T, K>,
) => WriteableLifeCycleServiceCollection<T, K, true>;

export type ReadonlyLifeCycleServiceGenerator<T = unknown, K = unknown> = (
  plugin: ReadonlyChatAreaPlugin<T, K>,
) => ReadonlyLifeCycleServiceCollection<T, K, true>;

export type WriteableAppLifeCycleServiceGenerator<T = unknown, K = unknown> = (
  plugin: WriteableChatAreaPlugin<T, K>,
) => Partial<WriteableAppLifeCycleService<T, K>>;

export type WriteableMessageLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: WriteableChatAreaPlugin<T, K>,
) => Partial<WriteableMessageLifeCycleService<T, K>>;

export type WriteableCommandLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: WriteableChatAreaPlugin<T, K>,
) => Partial<WriteableCommandLifeCycleService<T, K>>;

export type WriteableRenderLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: WriteableChatAreaPlugin<T, K>,
) => Partial<WriteableRenderLifeCycleService<T, K>>;

export type ReadonlyAppLifeCycleServiceGenerator<T = unknown, K = unknown> = (
  plugin: ReadonlyChatAreaPlugin<T, K>,
) => Partial<ReadonlyAppLifeCycleService<T, K>>;

export type ReadonlyMessageLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: ReadonlyChatAreaPlugin<T, K>,
) => Partial<ReadonlyMessageLifeCycleService<T, K>>;

export type ReadonlyCommandLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: ReadonlyChatAreaPlugin<T, K>,
) => Partial<ReadonlyCommandLifeCycleService<T, K>>;

export type ReadonlyRenderLifeCycleServiceGenerator<
  T = unknown,
  K = unknown,
> = (
  plugin: ReadonlyChatAreaPlugin<T, K>,
) => Partial<ReadonlyRenderLifeCycleService<T, K>>;
