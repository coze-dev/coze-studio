import { InputParameters, Outputs, Model } from '../../fields';
import { Skill } from './skill';

export function LLMContent() {
  return (
    <>
      <InputParameters />
      <Outputs />
      <Model />
      <Skill />
    </>
  );
}
