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
  type OnTextContentRenderingContext,
  type OnMessageBoxRenderContext,
} from '../../types/plugin-class/render-life-cycle';
import {
  ReadonlyLifeCycleService,
  WriteableLifeCycleService,
} from './life-cycle-service';

/**
 * ! 希望你注意到生命周期的上下文信息都放在ctx中
 * ! 如果判断只是上下文，请你注意收敛到ctx中，请勿增加新的参数
 * ! CodeReview的时候辛苦也注重一下这里
 */
export abstract class ReadonlyRenderLifeCycleService<
  T = unknown,
  K = unknown,
> extends ReadonlyLifeCycleService<T, K> {
  onTextContentRendering?(
    ctx: OnTextContentRenderingContext,
  ): OnTextContentRenderingContext;
  onMessageBoxRender?(
    ctx: OnMessageBoxRenderContext,
  ): OnMessageBoxRenderContext;
}

export abstract class WriteableRenderLifeCycleService<
  T = unknown,
  K = unknown,
> extends WriteableLifeCycleService<T, K> {
  onTextContentRendering?(
    ctx: OnTextContentRenderingContext,
  ): OnTextContentRenderingContext;
  onMessageBoxRender?(
    ctx: OnMessageBoxRenderContext,
  ): OnMessageBoxRenderContext;
}
