import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';

import { SystemError } from '@/components/node-system-error-render';

export function Error() {
  const node = useCurrentEntity();

  return <SystemError node={node} />;
}
