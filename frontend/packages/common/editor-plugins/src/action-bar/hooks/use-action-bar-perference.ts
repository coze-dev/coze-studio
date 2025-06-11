import { useContext } from 'react';

import { type ActionController, type ActionSize } from '../types';
import { ActionBarContext } from '../context';

interface ActionBarPreference {
  size: ActionSize;
  controller: ActionController;
}

export const useActionBarPreference = (): ActionBarPreference => {
  const { size, controller } = useContext(ActionBarContext);
  return { size, controller };
};
