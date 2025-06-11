import { type ReactNode } from 'react';

export type ItemType =
  | 'filed'
  | 'description'
  | 'default'
  | 'channel'
  | 'action';

export interface IHeaderItemProps {
  type: ItemType;
  className: string;
  title: string | ReactNode;
}
