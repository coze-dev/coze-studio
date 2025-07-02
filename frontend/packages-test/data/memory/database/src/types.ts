import { type ReactNode } from 'react';

export enum MemoryModule {
  Variable = 'variable',
  Database = 'database',
  LongTermMemory = 'longTermMemory',
  Filebox = 'filebox',
}

export interface MemoryDebugDropdownMenuItem {
  label: string;
  name: MemoryModule;
  icon: ReactNode;
  component: ReactNode;
}
