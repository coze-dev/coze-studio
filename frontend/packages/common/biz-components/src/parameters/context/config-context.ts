/* eslint-disable @typescript-eslint/naming-convention */
import { createContext } from 'react';

import type { ParametersProps } from '../types';

export type Configs = Omit<
  ParametersProps,
  'value' | 'onChange' | 'className' | 'style' | 'disabledTypes'
> & { hasObjectLike?: boolean };

const ConfigContext = createContext<Configs>({});

export default ConfigContext;
