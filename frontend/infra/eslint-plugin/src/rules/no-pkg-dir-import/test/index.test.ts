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
    modulePath: undefined, // modulePath 为 空
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
      name: 'some/pkg', // 包名称与引用路径相同
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
      name: undefined, // 解析到不规范配置的package.json
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/import/pkg',
    currentPkgPath: 'path/to/current/pkg',
    pkg: {
      name: '@types/pkg', // 解析到类型包
      exports: {},
    },
  },
  {
    code: "import pkg from 'pkg';",
    modulePath: 'path/to/module',
    moduleRealPath: 'path/to/module',
    importPkgPath: 'path/to/same/pkg', // 相同路径
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
    moduleRealPath: 'path/to/node_modules/pkg', // 解析到node_modules
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
      // TODO: 避免eslint duplication检测。可能需要改为其他方式
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
      exports: undefined, // 为空
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
