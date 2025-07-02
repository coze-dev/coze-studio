const path = require('path');
const fs = require('fs');

const ROOT_DIR = process.cwd();

// 工具函数 aa-bb-cc -> AaBbCc
const getPascalName = name =>
  name
    .split('-')
    .map(s => s.slice(0, 1).toUpperCase() + s.slice(1))
    .join('');

// 工具函数 aa-bb-cc -> aaBbCc
const getCamelName = name =>
  name
    .split('-')
    .map((s, i) => (i === 0 ? s : s.slice(0, 1).toUpperCase() + s.slice(1)))
    .join('');

// 工具函数 aa-bb-cc -> AA_BB_CC
const getConstantName = name =>
  name
    .split('-')
    .map(s => s.toUpperCase())
    .join('_');

module.exports = plop => {
  // 注册一个新的动作，用于在导出文件和注册文件中添加新的节点注册信息
  plop.setActionType('registryNode', async answers => {
    const { name, pascalName, supportTest } = answers;
    const constantName = getConstantName(name);
    const registryName = `${constantName}_NODE_REGISTRY`;

    // 修改导出文件
    const nodeExportFilePath = './src/node-registries/index.ts';
    const nodeContent = fs.readFileSync(nodeExportFilePath, 'utf8');
    const nodeContentNew = nodeContent.replace(
      '// cli 脚本插入标识（registry），请勿修改/删除此行注释',
      `export { ${registryName} } from './${name}';
// cli 脚本插入标识（registry），请勿修改/删除此行注释`,
    );
    fs.writeFileSync(nodeExportFilePath, nodeContentNew, 'utf8');

    // 修改注册文件
    const nodeRegistryFilePath = './src/nodes-v2/constants.ts';
    const nodeRegistryContent = fs.readFileSync(nodeRegistryFilePath, 'utf8');
    const nodeRegistryContentNew = nodeRegistryContent
      .replace(
        '// cli 脚本插入标识（import），请勿修改/删除此行注释',
        `${registryName},
  // cli 脚本插入标识（import），请勿修改/删除此行注释`,
      )
      .replace(
        '// cli 脚本插入标识（registry），请勿修改/删除此行注释',
        `// cli 脚本插入标识（registry），请勿修改/删除此行注释
  ${registryName},`,
      );
    fs.writeFileSync(nodeRegistryFilePath, nodeRegistryContentNew, 'utf8');

    // 修改 node-content 注册文件
    const nodeContentRegistryFilePath =
      './src/components/node-render/node-render-new/content/index.tsx';
    const nodeContentRegistryContent = fs.readFileSync(
      nodeContentRegistryFilePath,
      'utf8',
    );

    const nodeContentRegistryContentNew = nodeContentRegistryContent
      .replace(
        '// cli 脚本插入标识（import），请勿修改/删除此行注释',
        `import { ${pascalName}Content } from '@/node-registries/${name}';
// cli 脚本插入标识（import），请勿修改/删除此行注释`,
      )
      .replace(
        '// cli 脚本插入标识（registry），请勿修改/删除此行注释',
        `[StandardNodeType.${pascalName}]: ${pascalName}Content,
  // cli 脚本插入标识（registry），请勿修改/删除此行注释`,
      );
    fs.writeFileSync(
      nodeContentRegistryFilePath,
      nodeContentRegistryContentNew,
      'utf8',
    );

    // 如果节点无需支持单节点测试，删除 node-test 文件
    const testFilePath = path.resolve(
      ROOT_DIR,
      `./src/node-registries/${name}/node-test.ts`,
    );
    if (!supportTest && fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    return `节点 ${name} 已注册`;
  });

  // 注册一个新的生成器，用于创建新的节点目录和文件
  plop.setGenerator('create node', {
    description: 'generate template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message:
          '请输入组件名称，以"-"(空格)分隔，用于生成目录名称， eg: "database-create"',
      },
      {
        type: 'input',
        name: 'pascalName',
        message:
          '请确认大写驼峰命名，用于类名，注意特殊命名: http -> HTTP ，而不是 http -> Http: ',
        default: answers => getPascalName(answers.name),
      },
      {
        type: 'input',
        name: 'camelName',
        message:
          '请确认小写驼峰命名，用于变量前缀，注意特殊命名: my-ai -> myAI，而不是 my-ai -> myAi: ',
        default: answers => getCamelName(answers.name),
      },
      {
        type: 'confirm',
        name: 'supportTest',
        message: '是否支持单节点测试？',
        default: false,
      },
    ],
    actions: data => {
      const { name, pascalName, camelName, supportTest } = data;
      const constantName = getConstantName(data.name);
      const actions = [
        {
          type: 'addMany',
          destination: path.resolve(ROOT_DIR, `./src/node-registries/${name}`),
          templateFiles: 'templates',
          data: {
            PASCAL_NAME_PLACE_HOLDER: pascalName,
            CAMEL_NAME_PLACE_HOLDER: camelName,
            CONSTANT_NAME_PLACE_HOLDER: constantName,
            SUPPORT_TEST: supportTest,
          },
        },
        {
          type: 'registryNode',
        },
      ];
      return actions;
    },
  });
};
