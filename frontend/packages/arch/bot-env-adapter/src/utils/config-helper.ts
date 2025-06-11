/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import { base } from '../base';

const { REGION, IS_RELEASE_VERSION, IS_BOE } = base;

type TValue = string | number | boolean | null;

export interface TConfigEnv<TVal extends TValue = TValue> {
  cn: {
    boe: TVal;
    inhouse: TVal;
    release: TVal;
  };
  sg: {
    inhouse: TVal;
    release: TVal;
  };
  va: {
    release: TVal;
  };
}

export const extractEnvValue = <TConfigValue extends TValue = TValue>(
  config: TConfigEnv<TConfigValue>,
): TConfigValue => {
  let key: string;
  switch (REGION) {
    case 'cn': {
      key = IS_BOE ? 'boe' : IS_RELEASE_VERSION ? 'release' : 'inhouse';
      break;
    }
    case 'sg': {
      key = IS_RELEASE_VERSION ? 'release' : 'inhouse';
      break;
    }
    case 'va': {
      key = 'release';
      break;
    }
  }
  return config[REGION][key] as TConfigValue;
};

/**
 * template
const NAME =  extractEnvValue<string>({
  cn: {
    boe: ,
    inhouse: ,
  },
  sg: {
    inhouse: ,
    release: ,
  },
  va: {
    release: ,
  },
});
 */
