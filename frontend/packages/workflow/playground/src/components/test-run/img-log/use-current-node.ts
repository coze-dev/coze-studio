import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

export function useCurrentNode() {
  const node = useCurrentEntity();
  return node;
}
