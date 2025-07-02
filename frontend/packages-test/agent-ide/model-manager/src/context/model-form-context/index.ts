import { useContext } from 'react';

import { ModelFromContext, ModelFormProvider } from './context';

export { ModelFormProvider };
export const useModelForm = () => useContext(ModelFromContext);
