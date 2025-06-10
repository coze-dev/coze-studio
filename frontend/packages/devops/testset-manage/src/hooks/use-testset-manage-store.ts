import { useContext } from 'react';

import { useStore } from 'zustand';
import { CustomError } from '@coze-arch/bot-error';

import { type TestsetManageProps } from '../store';
import { TestsetManageContext } from '../context';

export function useTestsetManageStore<T>(
  selector: (s: TestsetManageProps) => T,
): T {
  const store = useContext(TestsetManageContext);

  if (!store) {
    throw new CustomError(
      'normal_error',
      'Missing TestsetManageProvider in the tree',
    );
  }

  return useStore(store, selector);
}
