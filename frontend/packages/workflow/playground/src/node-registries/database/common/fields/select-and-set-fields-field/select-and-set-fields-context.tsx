import { createContext, useContext } from 'react';

import { type DatabaseField } from '@coze-workflow/base';
interface SelectAndSetFieldsFieldContextProps {
  shouldDisableRemove?: (field?: DatabaseField) => boolean;
}

export const SelectAndSetFieldsFieldContext =
  createContext<SelectAndSetFieldsFieldContextProps>({});

export const useSelectAndSetFieldsContext = () =>
  useContext(SelectAndSetFieldsFieldContext);
