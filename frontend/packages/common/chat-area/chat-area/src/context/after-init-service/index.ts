import { useContext } from 'react';

import {
  type AfterInitService,
  AfterInitServiceContext,
} from './after-init-service-context';

export { AfterInitServiceProvider } from './after-init-service-context';

export const useAfterInitService = <Key extends keyof AfterInitService>(
  key: Key,
): Required<AfterInitService>[Key] => {
  const services = useContext(AfterInitServiceContext);
  const service = services[key];
  if (service === undefined) {
    throw new Error(`cannot find AfterInitService: ${key}`);
  }
  return service;
};

export const useMarkReadService = () => useAfterInitService('markReadService');
