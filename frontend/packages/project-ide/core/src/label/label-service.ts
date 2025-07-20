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
 
import { type Event } from '@flowgram-adapter/common';

import { type URI } from '../common';
import { type LabelChangeEvent } from './label-handler';

export const LabelService = Symbol('LabelService');
/**
 * 提供 全局的 label 数据获取
 */
export interface LabelService {
  /**
   * label 变化后触发
   */
  get onChange(): Event<LabelChangeEvent>;

  /**
   * 获取 label 的 icon
   * @param element
   */
  getIcon: (element: URI) => string | React.ReactNode;

  /**
   * 获取 label 的自定义渲染
   */
  renderer: (element: URI, opts?: any) => React.ReactNode;

  /**
   *  获取 label 名字
   * @param element
   */
  getName: (element: URI) => string;

  /**
   * 获取 label 的描述
   * @param element
   */
  getDescription: (element: URI) => string;
}
