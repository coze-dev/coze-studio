#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const { pascalize } = require('humps');

const setterName = process.argv[2];
if (!setterName) {
  console.error('Please provide a setter name.');
  process.exit(1);
}

const componentDir = path.join(__dirname, '..', 'src', setterName);
const indexFile = path.join(componentDir, 'index.ts');
const componentFile = path.join(componentDir, `${setterName}.tsx`);
const storiesFile = path.join(componentDir, 'index.stories.tsx');
const testFile = path.join(componentDir, 'index.test.tsx');
const styleFile = path.join(componentDir, `${setterName}.module.less`);
const packageIndexFile = path.join(__dirname, '..', 'src', 'index.ts');
const componentName = pascalize(setterName);

// 创建组件目录
if (fs.existsSync(componentDir)) {
  console.error('can not created because this setter existed.');
  process.exit(1);
}

fs.mkdirSync(componentDir);

// 创建 index.ts 文件
const indexContent = `export { ${componentName} } from './${setterName}';
export type { ${componentName}Options } from './${setterName}';`;
fs.writeFileSync(indexFile, indexContent);

// 创建 {setterName}.tsx 文件
const componentContent = `import type { Setter } from '../types';

import styles from './${setterName}.module.less';

export interface ${componentName}Options {}

export const ${componentName}: Setter<string, ${componentName}Options> = ({value, onChange, readonly, options={}}) => {
  return <div className={styles['${setterName}']}>This is ${setterName}</div>;
};
`;
fs.writeFileSync(componentFile, componentContent);

// 创建 index.stories.tsx 文件
const storiesContent = `import type { StoryObj, Meta } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';

import { ${componentName} } from './${setterName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'workflow setters/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  render: args => {
    const [, updateArgs] = useArgs();

    return (
      <${componentName}
        {...args}
        onChange={newValue => {
          updateArgs({ ...args, value: newValue });
        }}
      />
    );
  },
}

export default meta;

type Story = StoryObj<typeof ${componentName}>;

export const Base: Story = {};`;
fs.writeFileSync(storiesFile, storiesContent);

// 创建 index.test.tsx 文件
const testContent = `import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ${componentName} } from './${setterName}';

const mockProps = {
  value: '',
  onChange: vi.fn(),
  readonly: false,
};

describe('${componentName} Setter', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<${componentName} {...mockProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
`;
fs.writeFileSync(testFile, testContent);

// 创建 {setterName}.module.less 文件
const styleContent = `.${setterName} {
  // Your styles here
}
`;
fs.writeFileSync(styleFile, styleContent);

// 在包入口追加setter到导出
const packageIndexAppendedExportContent = `export { ${componentName} } from './${setterName}';
export type { ${componentName}Options } from './${setterName}';`;
fs.appendFileSync(packageIndexFile, packageIndexAppendedExportContent);

console.log(`Setter component ${setterName} created successfully.`);
