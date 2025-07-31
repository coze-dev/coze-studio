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

import { RuleTester } from 'eslint';
import resolve from 'eslint-module-utils/resolve';
import readPkgUp from 'eslint-module-utils/readPkgUp';
import { noPkgDirImport } from '../index';

const ruleTester = new RuleTester({});

vi.mock('eslint-module-utils/resolve', () => ({
  default: vi.fn(),
}));

vi.mock('eslint-module-utils/readPkgUp', () => ({
  default: vi.fn(),
}));

const validCases = [
  {
    code: 'import "xxx"',
    modulePath: undefined, // modulePath is empty
    moduleRealPath: undefined,
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: '',
      exports: {},
    },
  },
  {
    code: "import pkg from 'some/pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'some/pkg', // The package name is the same as the reference path
      exports: {},
    },
  },
  {
    code: "import pkg from 'some/pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: undefined, // Parse to the non-canonical package.json
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: '@types/pkg', // Parse to type package
      exports: {},
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/same/pkg', // same path
    currentPkgPath: 'path/to/same/pkg',
    pkg: {
      name: '@types/pkg',
      exports: {},
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: undefined,
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: {},
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/node_modules/pkg', // Parse to node_modules
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: {},
    },
  },
  {
    code: "import pkg from 'pkg/subPath';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: { subPath: './subPath' },
    },
  },
  {
    code: "import pkg from 'pkg/sub/path';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: { 'sub/*': './subPath' },
    },
  },
].map(c => {
  vi.mocked(resolve).mockReturnValueOnce(c.modulePath);

  if (!c.modulePath) {
    return {
      code: c.code,
      // TODO: Avoid eslint duplication. It may need to be changed to another way
      settings: c,
    };
  }

  if (c.pkg.name) {
    vi.mocked(resolve).mockReturnValueOnce(c.moduleRealPath);
  }

  vi.mocked(readPkgUp)
    .mockReturnValueOnce({
      pkg: c.pkg,
      path: c.importPkgPath,
    })
    .mockReturnValueOnce({
      path: c.currentPkgPath,
    });

  return {
    code: c.code,
    settings: c,
  };
});

const invalidCases = [
  {
    code: "import pkg from 'pkg/subPath';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: undefined, // empty
    },
    messageId: 'noExportsCfg',
  },
  {
    code: "import pkg from 'pkg/subPath';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: 'main.js', // isString
    },
    messageId: 'noExportsCfg',
  },
  {
    code: "import pkg from 'pkg/subPath';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: { otherPath: 'otherPath' },
    },
    messageId: 'invalidSubpath',
  },
  {
    code: "import pkg from 'pkg/sub/path';",
    modulePath: 'path/to/pkg',
    moduleRealPath: 'path/to/pkg',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: 'pkg',
      exports: {
        sub: './sub',
      },
    },
    messageId: 'invalidSubpath',
  },
].map(c => {
  vi.mocked(resolve).mockReturnValueOnce(c.modulePath);

  if (!c.modulePath) {
    return {
      settings: c,
      code: c.code,
      errors: [],
    };
  }

  vi.mocked(resolve).mockReturnValueOnce(c.moduleRealPath);

  vi.mocked(readPkgUp)
    .mockReturnValueOnce({
      pkg: c.pkg,
      path: c.importPkgPath,
    })
    .mockReturnValueOnce({
      path: c.currentPkgPath,
    });
  return {
    settings: c,
    code: c.code,
    errors: [
      {
        messageId: c.messageId,
      },
    ],
  };
});

ruleTester.run('no-pkg-dir-import', noPkgDirImport, {
  valid: [...validCases],
  invalid: [...invalidCases],
});
