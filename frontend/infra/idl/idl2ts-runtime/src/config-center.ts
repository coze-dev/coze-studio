import type { IdlConfig } from './utils';

class ConfigCenter {
  private config: Map<string, IdlConfig> = new Map();
  register(service: string, config: IdlConfig): void {
    this.config.set(service, config);
  }
  getConfig(service: string): IdlConfig | undefined {
    return this.config.get(service);
  }
}

export const configCenter = new ConfigCenter();

export function registerConfig(service: string, config: IdlConfig): void {
  if (configCenter.getConfig(service)) {
    console.warn(`${service} api config has already been set,make sure they are the same`);
  }
  configCenter.register(service, config);
}
