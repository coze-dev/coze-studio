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
