import { type ViewPluginOptions } from '../types/view';

export interface ViewOptionRegisterService {
  register: (options: Partial<ViewPluginOptions>) => void;
}

interface ViewContribution {
  registerView(service: ViewOptionRegisterService): void;
}

const ViewContribution = Symbol('ViewContribution');

export { ViewContribution };
