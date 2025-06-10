import { useContext } from 'react';

import ConfigContext from '../context/config-context';
import type { Configs } from '../context/config-context';

export default function useConfig(): Configs {
  const config = useContext(ConfigContext);
  return config;
}
