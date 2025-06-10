import { extractEnvValue } from '../utils/config-helper';

const VOLCANO_PLATFORM_ID = extractEnvValue<number | null>({
  cn: {
    boe: 0,
    inhouse: 0,
    release: 0,
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

const VOLCANO_PLATFORM_APP_KEY = extractEnvValue<string | null>({
  cn: {
    boe: '0',
    inhouse: '0',
    release: '0',
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

const VOLCANO_IDENTITY_DOMAIN = extractEnvValue<string | null>({
  cn: {
    boe: '',
    inhouse: '',
    release: '',
  },
  sg: {
    inhouse: null,
    release: null,
  },
  va: {
    release: null,
  },
});

export const volcanoConfigs = {
  VOLCANO_PLATFORM_ID,
  VOLCANO_PLATFORM_APP_KEY,
  VOLCANO_IDENTITY_DOMAIN,
};
