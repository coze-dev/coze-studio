# @coze-arch/eslint-plugin

A comprehensive ESLint plugin designed for Flow applications, providing essential linting rules for code quality, import management, and Zustand state management best practices.

## Features

### Core Rules
- **Import Management**: Prevent deep relative imports and batch import/export issues
- **Code Quality**: Enforce function length limits, proper error handling, and catch block usage
- **Package Management**: Validate package.json structure and dependencies
- **React/TSX**: Prevent leaked renders and other React-specific issues

### Zustand Rules
- **State Management**: Enforce proper state mutation patterns and store conventions
- **Performance**: Optimize selector usage and prevent unnecessary re-renders
- **Best Practices**: Enforce naming conventions and proper store typing

### Processors
- **JSON Processor**: Custom processor for linting package.json files

## Get Started

### Installation

```bash
# Install the package
rush update

# Or using pnpm in workspace
pnpm add @coze-arch/eslint-plugin@workspace:*
```

### Basic Usage

Add the plugin to your ESLint configuration:

```js
// eslint.config.js
import flowPlugin from '@coze-arch/eslint-plugin';

export default [
  {
    plugins: {
      '@coze-arch': flowPlugin,
    },
    rules: {
      '@coze-arch/no-deep-relative-import': ['error', { max: 4 }],
      '@coze-arch/max-line-per-function': ['error', { max: 150 }],
      '@coze-arch/tsx-no-leaked-render': 'warn',
    },
  },
];
```

### Using Recommended Configuration

```js
// eslint.config.js
import flowPlugin from '@coze-arch/eslint-plugin';

export default [
  ...flowPlugin.configs.recommended,
];
```

### Zustand Rules

```js
// eslint.config.js
import zustandPlugin from '@coze-arch/eslint-plugin/zustand';

export default [
  {
    plugins: {
      '@coze-arch/zustand': zustandPlugin,
    },
    ...zustandPlugin.configs.recommended,
  },
];
```

## API Reference

### Core Rules

#### `no-deep-relative-import`
Prevents excessive relative import nesting.

```js
// ❌ Bad (default max: 3)
import something from '../../../deep/path';

// ✅ Good
import something from '../../shallow/path';
```

**Options:**
- `max` (number): Maximum allowed relative path depth (default: 3)

#### `max-line-per-function`
Enforces maximum lines per function.

```js
// ❌ Bad (exceeds limit)
function longFunction() {
  // ... 200 lines of code
}

// ✅ Good
function shortFunction() {
  // ... less than 150 lines
}
```

**Options:**
- `max` (number): Maximum lines per function (default: 150)

#### `tsx-no-leaked-render`
Prevents leaked renders in TSX components.

```js
// ❌ Bad
{count && <Component />} // count could be 0

// ✅ Good
{count > 0 && <Component />}
{Boolean(count) && <Component />}
```

#### `no-pkg-dir-import`
Prevents importing from package directories.

```js
// ❌ Bad
import something from 'package/src/internal';

// ✅ Good
import something from 'package';
```

#### `use-error-in-catch`
Enforces proper error handling in catch blocks.

```js
// ❌ Bad
try {
  doSomething();
} catch (e) {
  console.log('error occurred');
}

// ✅ Good
try {
  doSomething();
} catch (error) {
  console.error('error occurred:', error);
}
```

#### `no-empty-catch`
Prevents empty catch blocks.

```js
// ❌ Bad
try {
  doSomething();
} catch (error) {
  // empty
}

// ✅ Good
try {
  doSomething();
} catch (error) {
  console.error(error);
}
```

#### `no-new-error`
Discourages creating new Error instances.

```js
// ❌ Bad
throw new Error('Something went wrong');

// ✅ Good (when configured)
throw createError('Something went wrong');
```

### Zustand Rules

#### `no-state-mutation`
Prevents direct state mutation in Zustand stores.

```js
// ❌ Bad
const state = useStore.getState();
state.count = 5;

// ✅ Good
useStore.setState({ count: 5 });
```

#### `prefer-selector`
Encourages using selectors for state access.

```js
// ❌ Bad
const { count, name } = useStore();

// ✅ Good
const count = useStore(state => state.count);
const name = useStore(state => state.name);
```

#### `store-name-convention`
Enforces naming conventions for stores.

```js
// ❌ Bad
const myStore = create(() => ({}));

// ✅ Good
const useMyStore = create(() => ({}));
```

#### `prefer-shallow`
Encourages using shallow equality for object selections.

```js
// ❌ Bad
const { user, settings } = useStore(state => ({
  user: state.user,
  settings: state.settings
}));

// ✅ Good
const { user, settings } = useStore(
  state => ({ user: state.user, settings: state.settings }),
  shallow
);
```

### Package.json Rules

#### `package-require-author`
Ensures package.json has an author field.

```json
{
  "name": "my-package",
  "author": "developer@example.com"
}
```

#### `package-disallow-deps`
Prevents usage of disallowed dependencies (configurable).

## Development

### Setup

```bash
# Install dependencies
rush update

# Run tests
rushx test

# Run with coverage
rushx test:cov

# Lint code
rushx lint

# Build (no-op for this package)
rushx build
```

### Project Structure

```
src/
├── index.ts              # Main plugin entry
├── processors/
│   └── json.ts          # JSON processor for package.json
├── rules/               # Core ESLint rules
│   ├── no-deep-relative-import/
│   ├── max-lines-per-function/
│   ├── tsx-no-leaked-render/
│   └── ...
└── zustand/             # Zustand-specific rules
    ├── index.ts         # Zustand plugin entry
    └── rules/
        ├── no-state-mutation/
        ├── prefer-selector/
        └── ...
```

### Adding New Rules

1. Create a new directory under `src/rules/` or `src/zustand/rules/`
2. Implement the rule in `index.ts`
3. Add comprehensive tests in `index.test.ts`
4. Export the rule in the main plugin file
5. Add the rule to recommended configuration if appropriate

### Testing

Tests are written using ESLint's `RuleTester`:

```ts
import { RuleTester } from 'eslint';
import { myRule } from './index';

const ruleTester = new RuleTester();

ruleTester.run('my-rule', myRule, {
  valid: [
    // Valid code examples
  ],
  invalid: [
    // Invalid code examples with expected errors
  ],
});
```

## Dependencies

### Runtime Dependencies
- `@typescript-eslint/utils` - TypeScript ESLint utilities
- `eslint-module-utils` - ESLint module resolution utilities
- `eslint-rule-composer` - Rule composition utilities
- `eslint-traverse` - AST traversal utilities
- `eslint-utils` - General ESLint utilities
- `semver` - Semantic versioning utilities

### Development Dependencies
- `@typescript-eslint/rule-tester` - Rule testing utilities
- `vitest` - Test runner
- `eslint` - ESLint core
- TypeScript and various ESLint plugins for development

## License

Apache-2.0 License

## Author

fanwenjie.fe@bytedance.com

---

For more information about ESLint plugin development, see the [ESLint Plugin Developer Guide](https://eslint.org/docs/developer-guide/).
