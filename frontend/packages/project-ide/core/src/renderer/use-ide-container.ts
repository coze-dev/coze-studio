import React from 'react';

import { type interfaces } from 'inversify';

import { IDEContainerContext } from './context';

/**
 * 获取 ide inversify container
 */
export function useIDEContainer(): interfaces.Container {
  return React.useContext(IDEContainerContext);
}
