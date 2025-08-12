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
 * Provide, global label data acquisition
 */
export interface LabelService {
  /**
   * Triggered after label change
   */
  get onChange(): Event<LabelChangeEvent>;

  /**
   * Get label icon
   * @param element
   */
  getIcon: (element: URI) => string | React.ReactNode;

  /**
   * Get custom rendering of label
   */
  renderer: (element: URI, opts?: any) => React.ReactNode;

  /**
   *  Get label name
   * @param element
   */
  getName: (element: URI) => string;

  /**
   * Get the description of the label
   * @param element
   */
  getDescription: (element: URI) => string;
}
