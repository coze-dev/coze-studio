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
   * IDE 初始化阶段
   */
  onInit() {}

  /**
   * 注册 commands
   * @param registry
   */
  registerCommands(registry: CommandRegistry) {}
}
