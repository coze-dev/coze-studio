import { useLayoutEffect } from 'react';

import { useInjector } from '@coze-editor/editor/react';
import { languageSupport } from '@coze-editor/editor/preset-prompt';

// eslint-disable-next-line @typescript-eslint/naming-convention
function LanguageSupport() {
  const injector = useInjector();

  useLayoutEffect(() => injector.inject([languageSupport]), [injector]);

  return null;
}

export { LanguageSupport };
