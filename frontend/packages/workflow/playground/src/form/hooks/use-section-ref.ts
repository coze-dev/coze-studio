import { useRef } from 'react';

import { type SectionRefType } from '../type';

export function useSectionRef() {
  const ref = useRef<SectionRefType>();

  return ref;
}
