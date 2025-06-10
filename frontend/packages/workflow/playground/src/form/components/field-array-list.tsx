import { type PropsWithChildren } from 'react';

export function FieldArrayList({ children }: PropsWithChildren) {
  return <div className="flex flex-col gap-[8px]">{children}</div>;
}
