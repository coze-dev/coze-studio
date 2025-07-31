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

import { type LifeCycleContext } from '../types';
import { SystemRenderLifeCycleService } from './render-life-cycle';
import { SystemMessageLifeCycleService } from './message-life-cycle';
import { SystemCommandLifeCycleService } from './command-life-cycle';
import { SystemAppLifeCycleService } from './app-life-cycle';

export class SystemLifeCycleService {
  lifeCycleContext: LifeCycleContext;

  app: SystemAppLifeCycleService;
  command: SystemCommandLifeCycleService;
  message: SystemMessageLifeCycleService;
  render: SystemRenderLifeCycleService;

  constructor(lifeCycleContext: LifeCycleContext) {
    this.lifeCycleContext = lifeCycleContext;

    this.app = new SystemAppLifeCycleService(this.lifeCycleContext);
    this.command = new SystemCommandLifeCycleService(this.lifeCycleContext);
    this.message = new SystemMessageLifeCycleService(this.lifeCycleContext);
    this.render = new SystemRenderLifeCycleService(this.lifeCycleContext);
  }
}
