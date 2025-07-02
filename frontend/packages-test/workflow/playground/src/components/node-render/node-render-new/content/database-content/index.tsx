import { Outputs, InputParameters } from '../../fields';
import { Database } from './database';

export function DatabaseContent() {
  return (
    <>
      <InputParameters />
      <Outputs />
      <Database />
    </>
  );
}
