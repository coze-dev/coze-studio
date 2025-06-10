import { type ReactElement } from 'react';

export interface TabItem {
  label: string;
  value: string;
  component: ReactElement;
}
