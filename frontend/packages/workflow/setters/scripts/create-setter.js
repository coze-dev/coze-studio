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

// Create component catalog
if (fs.existsSync(componentDir)) {
  console.error('can not created because this setter existed.');
  process.exit(1);
}

fs.mkdirSync(componentDir);

// Create the index.ts file
const indexContent = `export { ${componentName} } from './${setterName}';
export type { ${componentName}Options } from './${setterName}';`;
fs.writeFileSync(indexFile, indexContent);

// Create the {setterName} .tsx file
const componentContent = `import type { Setter } from '../types';

import styles from './${setterName}.module.less';

export interface ${componentName}Options {}

export const ${componentName}: Setter<string, ${componentName}Options> = ({value, onChange, readonly, options={}}) => {
  return <div className={styles['${setterName}']}>This is ${setterName}</div>;
};
`;
fs.writeFileSync(componentFile, componentContent);

// Create the index.stories.tsx file
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

// Create the index.test.tsx file
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

// Create the {setterName} .module.less file
const styleContent = `.${setterName} {
  // Your styles here
}
`;
fs.writeFileSync(styleFile, styleContent);

// Append setter to export in package entry
const packageIndexAppendedExportContent = `export { ${componentName} } from './${setterName}';
export type { ${componentName}Options } from './${setterName}';`;
fs.appendFileSync(packageIndexFile, packageIndexAppendedExportContent);

console.log(`Setter component ${setterName} created successfully.`);
