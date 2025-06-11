import { type ReactNode } from 'react';
export interface Library {
  id: string;
  iconUrl?: string;
  name?: string;
  nameExtra?: string | ReactNode;
  description?: string;
  isInvalid?: boolean;
}
