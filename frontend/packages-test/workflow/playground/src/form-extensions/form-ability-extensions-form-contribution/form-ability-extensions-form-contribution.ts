import { injectable } from 'inversify';
import {
  DecoratorAbility,
  type FormContribution,
  type FormManager,
  SetterAbility,
} from '@flowgram-adapter/free-layout-editor';

import { setters } from '../setters';
import { decorators } from '../decorators';

@injectable()
export class FormAbilityExtensionsFormContribution implements FormContribution {
  onRegister(formManager: FormManager): void {
    setters.forEach(setter => {
      formManager.registerAbilityExtension(SetterAbility.type, setter);
    });

    decorators.forEach(decorator => {
      formManager.registerAbilityExtension(DecoratorAbility.type, decorator);
    });
  }
}
