import { type interfaces } from 'inversify';

export const ContainerFactory = Symbol('ContainerFactory');

export interface ContainerFactory {
  createChild: interfaces.Container['createChild'];
}
