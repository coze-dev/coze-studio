import { type ProjectFormValues } from '../components/project-form';

export const commonProjectFormValid = (
  values: Pick<ProjectFormValues, 'name'>,
) => Boolean(values.name?.trim());
