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
  type WriteableRenderLifeCycleService,
  type ReadonlyRenderLifeCycleService,
} from '../../plugin-class/service/render-life-cycle-service';
import {
  type ReadonlyMessageLifeCycleService,
  type WriteableMessageLifeCycleService,
} from '../../plugin-class/service/message-life-cycle-service';
import {
  type WriteableLifeCycleService,
  type ReadonlyLifeCycleService,
} from '../../plugin-class/service/life-cycle-service';
import {
  type WriteableCommandLifeCycleService,
  type ReadonlyCommandLifeCycleService,
} from '../../plugin-class/service/command-life-cycle-service';
import {
  type ReadonlyAppLifeCycleService,
  type WriteableAppLifeCycleService,
} from '../../plugin-class/service/app-life-cycle-service';

type OmitPluginInstance<
  T extends ReadonlyLifeCycleService | WriteableLifeCycleService,
> = Omit<T, 'pluginInstance'>;

type NormalWriteableAppLifeCycleService<T = unknown, K = unknown> =
  | WriteableAppLifeCycleService<T, K>
  | ReadonlyAppLifeCycleService<T, K>;

type OmittedWriteableAppLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<NormalWriteableAppLifeCycleService<T, K>>;

type NormalWriteableMessageLifeCycleService<T = unknown, K = unknown> =
  | WriteableMessageLifeCycleService<T, K>
  | ReadonlyMessageLifeCycleService<T, K>;

type OmittedWriteableMessageLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<NormalWriteableMessageLifeCycleService<T, K>>;

type NormalWriteableCommandLifeCycleService<T = unknown, K = unknown> =
  | WriteableCommandLifeCycleService<T, K>
  | ReadonlyCommandLifeCycleService<T, K>;

type OmittedWriteableCommandLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<NormalWriteableCommandLifeCycleService<T, K>>;

type NormalWriteableRenderLifeCycleService<T = unknown, K = unknown> =
  | WriteableRenderLifeCycleService<T, K>
  | ReadonlyRenderLifeCycleService<T, K>;

type OmittedWriteableRenderLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<NormalWriteableRenderLifeCycleService<T, K>>;

type NormalReadonlyAppLifeCycleService<
  T = unknown,
  K = unknown,
> = ReadonlyAppLifeCycleService<T, K>;

type OmittedReadonlyAppLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<ReadonlyAppLifeCycleService<T, K>>;

type NormalReadonlyMessageLifeCycleService<
  T = unknown,
  K = unknown,
> = ReadonlyMessageLifeCycleService<T, K>;

type OmittedReadonlyMessageLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<ReadonlyMessageLifeCycleService<T, K>>;

type NormalReadonlyCommandLifeCycleService<
  T = unknown,
  K = unknown,
> = ReadonlyCommandLifeCycleService<T, K>;

type OmittedReadonlyCommandLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<ReadonlyCommandLifeCycleService<T, K>>;

type NormalReadonlyRenderLifeCycleService<
  T = unknown,
  K = unknown,
> = ReadonlyRenderLifeCycleService<T, K>;

type OmittedReadonlyRenderLifeCycleService<
  T = unknown,
  K = unknown,
> = OmitPluginInstance<ReadonlyRenderLifeCycleService<T, K>>;

export interface WriteableLifeCycleServiceCollection<
  T = unknown,
  K = unknown,
  U extends boolean = false,
> {
  appLifeCycleService?: U extends true
    ? OmittedWriteableAppLifeCycleService<T, K>
    : NormalWriteableAppLifeCycleService<T, K>;
  messageLifeCycleService?: U extends true
    ? OmittedWriteableMessageLifeCycleService<T, K>
    : NormalWriteableMessageLifeCycleService<T, K>;
  commandLifeCycleService?: U extends true
    ? OmittedWriteableCommandLifeCycleService<T, K>
    : NormalWriteableCommandLifeCycleService;
  renderLifeCycleService?: U extends true
    ? OmittedWriteableRenderLifeCycleService<T, K>
    : NormalWriteableRenderLifeCycleService<T, K>;
}

export interface ReadonlyLifeCycleServiceCollection<
  T = unknown,
  K = unknown,
  U extends boolean = false,
> {
  appLifeCycleService?: U extends true
    ? OmittedReadonlyAppLifeCycleService<T, K>
    : NormalReadonlyAppLifeCycleService<T, K>;
  messageLifeCycleService?: U extends true
    ? OmittedReadonlyMessageLifeCycleService<T, K>
    : NormalReadonlyMessageLifeCycleService<T, K>;
  commandLifeCycleService?: U extends true
    ? OmittedReadonlyCommandLifeCycleService<T, K>
    : NormalReadonlyCommandLifeCycleService<T, K>;
  renderLifeCycleService?: U extends true
    ? OmittedReadonlyRenderLifeCycleService<T, K>
    : NormalReadonlyRenderLifeCycleService<T, K>;
}
