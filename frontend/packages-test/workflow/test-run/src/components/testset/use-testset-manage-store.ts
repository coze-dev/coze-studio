import { useContext } from 'react';

import { shallow } from 'zustand/shallow';
import { useStore } from 'zustand';

import {
  TestsetManageContext,
  type TestsetManageState,
  type TestsetManageAction,
} from './manage-provider';

export const useTestsetManageStore = <T>(
  selector: (s: TestsetManageState & TestsetManageAction) => T,
) => {
  const store = useContext(TestsetManageContext);

  return useStore(store, selector, shallow);
};
