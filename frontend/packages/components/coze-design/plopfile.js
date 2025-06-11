const getPascalName = name =>
  name
    .split('-')
    .map(s => s.slice(0, 1).toUpperCase() + s.slice(1))
    .join('');

const getCamelNameName = name =>
  name
    .split('-')
    .map((s, i) => (i === 0 ? s : s.slice(0, 1).toUpperCase() + s.slice(1)))
    .join('');

module.exports = plop => {
  plop.setGenerator('template', {
    description: 'generate template',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '请输入组件名称,以 - 分隔 (eg: button-group): ',
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
        default: answers => getCamelNameName(answers.name),
      },
    ],
    actions: data => {
      // 下划线分隔  button-group
      const { name = '', pascalName, camelName } = data;

      const files = [
        {
          from: 'src/components/__template__/index.css._hbs',
          to: `src/components/${name}/index.css`,
        },
        {
          from: 'src/components/__template__/index.ts._hbs',
          to: `src/components/${name}/index.ts`,
        },
        {
          from: 'src/components/__template__/index.mdx._hbs',
          to: `src/components/${name}/index.mdx`,
        },
        {
          from: 'src/components/__template__/temp-types.ts._hbs',
          to: `src/components/${name}/${name}-types.ts`,
        },
        {
          from: 'src/components/__template__/temp-variant.ts._hbs',
          to: `src/components/${name}/${name}-variant.ts`,
        },
        {
          from: 'src/components/__template__/temp.tsx._hbs',
          to: `src/components/${name}/${name}.tsx`,
        },
        {
          from: 'src/components/__template__/__tests__/temp.test.tsx._hbs',
          to: `src/components/${name}/__tests__/${name}.test.tsx`,
        },
        {
          from: 'src/components/__template__/stories/temp.stories.tsx._hbs',
          to: `src/components/${name}/stories/${name}.stories.tsx`,
        },
      ];

      return files.map(file => ({
        type: 'add',
        path: file.to,
        templateFile: file.from,
        data: {
          name,
          pascalName,
          camelName,
        },
      }));
    },
  });
};
