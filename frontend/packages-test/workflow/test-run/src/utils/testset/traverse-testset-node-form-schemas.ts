import { type NodeFormSchema, type FormItemSchema } from '../../types';

export const traverseTestsetNodeFormSchemas = (
  schemas: NodeFormSchema[],
  cb: (s: NodeFormSchema, ip: FormItemSchema) => any,
) => {
  for (const schema of schemas) {
    for (const ipt of schema.inputs) {
      cb(schema, ipt);
    }
  }
};
