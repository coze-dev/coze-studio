import { Intents } from '@/components/node-render/node-render-new/fields';

import { InputParameters, Outputs } from '../common/components';

export function IntentContent() {
  return (
    <>
      <InputParameters />
      <Outputs />
      <Intents />
    </>
  );
}
