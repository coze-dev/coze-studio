import { useLayoutEffect } from 'react';

import { useInjector } from '@flow-lang-sdk/editor/react';
import { languageSupport } from '@flow-lang-sdk/editor/preset-prompt';

// eslint-disable-next-line @typescript-eslint/naming-convention
function LanguageSupport() {
  const injector = useInjector();

  useLayoutEffect(() => injector.inject([languageSupport]), [injector]);

  return null;
}

export { LanguageSupport };
