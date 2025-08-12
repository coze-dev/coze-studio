/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
