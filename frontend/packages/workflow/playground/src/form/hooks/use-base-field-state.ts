import { useCurrentFieldState } from '@flowgram-adapter/free-layout-editor';

import { type BaseFieldState } from '../type';

export function useBaseFieldState() {
  const fieldState = useCurrentFieldState() as unknown as BaseFieldState;
  return fieldState;
}
