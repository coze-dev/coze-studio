import { type IGenOptions } from './types';
import { ClientGenerator } from './core';

export * from './context';

export function genClient(params: IGenOptions) {
  const clientGenerator = new ClientGenerator(params);
  clientGenerator.run();
}
