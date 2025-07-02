import { type NodeFormSchema, type FormItemSchema } from '../../types';
export const getTestsetFormSubFieldName = (
  formSchema: NodeFormSchema,
  itemSchema: FormItemSchema,
) => `${itemSchema.name}_${formSchema.component_id}`;
