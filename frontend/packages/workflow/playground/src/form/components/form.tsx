import { type PropsWithChildren } from 'react';

import { FormProvider } from '../contexts';

type FormProps = PropsWithChildren & {
  readonly?: boolean;
};

export function Form({ children, readonly = false }: FormProps) {
  return <FormProvider value={{ readonly }}>{children}</FormProvider>;
}
