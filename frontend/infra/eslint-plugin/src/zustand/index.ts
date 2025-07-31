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

import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { noGetStateInComp } from './rules/no-get-state-in-comp';
import { noStateMutation } from './rules/no-state-mutation';
import { preferCurryCreate } from './rules/prefer-curry-create';
import { preferSelector } from './rules/prefer-selector';
import { preferShallow } from './rules/prefer-shallow';
import { properStoreTyping } from './rules/proper-store-typing';
import { storeFilenameConvention } from './rules/store-filename-convention';
import { storeNameConvention } from './rules/store-name-convention';
import { devtoolsConfig } from './rules/zustand-devtools-config';
import { preferMiddlewares } from './rules/zustand-prefer-middlewares';

export const flowPreset: Linter.Plugin = {
  rules: {
    'prefer-selector': preferSelector,
    'prefer-shallow': preferShallow,
    'store-name-convention': storeNameConvention,
    'no-state-mutation': noStateMutation,
    'store-filename-convention': storeFilenameConvention,
    'prefer-curry-create': preferCurryCreate,
    'prefer-middlewares': preferMiddlewares,
    'devtools-config': devtoolsConfig,
    'proper-store-typing': properStoreTyping,
    'no-get-state-in-comp': noGetStateInComp,
  },
  configs: {
    recommended: {
      rules: {
        '@coze-arch/zustand/no-get-state-in-comp': 'warn',
        '@coze-arch/zustand/proper-store-typing': 'warn',
        '@coze-arch/zustand/devtools-config': 'warn',
        '@coze-arch/zustand/prefer-middlewares': 'warn',
        '@coze-arch/zustand/prefer-curry-create': 'warn',
        '@coze-arch/zustand/no-state-mutation': 'error',
        '@coze-arch/zustand/store-filename-convention': 'warn',
        '@coze-arch/zustand/store-name-convention': 'error',
        '@coze-arch/zustand/prefer-selector': 'warn',
        '@coze-arch/zustand/prefer-shallow': 'warn',
      },
    },
  },
};
