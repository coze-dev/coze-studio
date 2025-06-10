import { inject, injectable, named } from 'inversify';
import { ContributionProvider } from '@flowgram-adapter/common';

import { type LifecycleContribution } from '../common';
import { PreferencesManager } from './preferences-manager';
import { PreferenceContribution } from './preference-contribution';

@injectable()
class PreferencesContribution implements LifecycleContribution {
  @inject(ContributionProvider)
  @named(PreferenceContribution)
  protected readonly preferenceContributions: ContributionProvider<PreferenceContribution>;

  @inject(PreferencesManager)
  protected readonly preferencesManager: PreferencesManager;

  onInit() {
    this.preferenceContributions.getContributions().forEach(contrib => {
      this.preferencesManager.setSchema(contrib.configuration);
    });
  }
}

export { PreferencesContribution };
