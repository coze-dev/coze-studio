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

/* eslint-disable @typescript-eslint/no-empty-function */
import { inject, injectable } from 'inversify';
import {
  OpenerService,
  NavigationService,
  type CommandContribution,
  type CommandRegistry,
  type LifecycleContribution,
} from '@coze-project-ide/core';

@injectable()
export class ClientDefaultContribution
  implements CommandContribution, LifecycleContribution
{
  @inject(NavigationService)
  protected readonly navigationService: NavigationService;

  @inject(OpenerService)
  protected readonly openerService: OpenerService;

  /**
   * IDE initialization phase
   */
  onInit() {}

  /**
   * Registration commands
   * @param registry
   */
  registerCommands(registry: CommandRegistry) {}
}
