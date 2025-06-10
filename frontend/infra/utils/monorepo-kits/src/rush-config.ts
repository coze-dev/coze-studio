import { RushConfiguration } from '@rushstack/rush-sdk';

export const getRushConfiguration = (() => {
  let rushConfig: RushConfiguration;
  return () => {
    if (!rushConfig) {
      rushConfig = RushConfiguration.loadFromDefaultLocation({});
    }
    return rushConfig;
  };
})();
