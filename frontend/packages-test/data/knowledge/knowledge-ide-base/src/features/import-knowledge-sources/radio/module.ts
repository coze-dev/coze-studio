import type { ComponentProps, ReactElement } from 'react';

import type { KnowledgeSourceRadio } from '@/components/knowledge-source-radio';

export interface ImportKnowledgeRadioSourceModule {
  Component: () => ReactElement<
    ComponentProps<typeof KnowledgeSourceRadio>
  > | null;
}
