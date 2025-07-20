# @coze-arch/fs-enhance

> Enhanced file system utilities for improved developer experience

## Project Overview

`@coze-arch/fs-enhance` is a lightweight TypeScript utility library that provides enhanced file system operations with modern async/await API. It offers convenient wrappers around Node.js file system operations with built-in support for JSON5 and YAML parsing, making it easier to work with configuration files and common file operations in your projects.

## Features

- ✅ **Async/Await Support** - Modern promise-based API for all file operations
- ✅ **Type Safe** - Full TypeScript support with generic types for parsed content
- ✅ **JSON5 Support** - Read JSON files with comments and relaxed syntax
- ✅ **YAML Support** - Parse YAML configuration files
- ✅ **File/Directory Checks** - Convenient existence checks for files and directories
- ✅ **Directory Creation** - Recursive directory creation with existence checks
- ✅ **Line Counting** - Utility to count lines in text files
- ✅ **Zero Dependencies** - Minimal external dependencies (only json5 and yaml)

## Get Started

### Installation

Since this is a workspace package, install it using the workspace protocol:

```bash
# Add to your package.json dependencies
"@coze-arch/fs-enhance": "workspace:*"

# Then run rush update
rush update
```

### Basic Usage

```typescript
import {
  isFileExists,
  isDirExists,
  readJsonFile,
  readYamlFile,
  writeJsonFile,
  ensureDir,
  readFileLineCount
} from '@coze-arch/fs-enhance';

// Check if file exists
const exists = await isFileExists('./config.json');

// Read JSON with type safety
interface Config {
  name: string;
  version: string;
}
const config = await readJsonFile<Config>('./config.json');

// Create directory if it doesn't exist
await ensureDir('./dist/output');
```

## API Reference

### File Existence Checks

#### `isFileExists(file: string): Promise<boolean>`

Checks if a file exists and is actually a file (not a directory).

```typescript
const exists = await isFileExists('./package.json');
if (exists) {
  console.log('Package.json found!');
}
```

#### `isDirExists(file: string): Promise<boolean>`

Checks if a directory exists and is actually a directory (not a file).

```typescript
const exists = await isDirExists('./src');
if (exists) {
  console.log('Source directory found!');
}
```

### File Reading Operations

#### `readJsonFile<T>(file: string): Promise<T>`

Reads and parses a JSON file with JSON5 support (allows comments and relaxed syntax). Returns a typed result.

```typescript
interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

const pkg = await readJsonFile<PackageJson>('./package.json');
console.log(`Package: ${pkg.name}@${pkg.version}`);
```

#### `readYamlFile<T extends object>(filePath: string): Promise<T>`

Reads and parses a YAML file. Returns a typed result.

```typescript
interface DockerCompose {
  version: string;
  services: Record<string, any>;
}

const compose = await readYamlFile<DockerCompose>('./docker-compose.yml');
console.log(`Docker Compose version: ${compose.version}`);
```

#### `readFileLineCount(file: string): Promise<number>`

Counts the number of lines in a text file.

```typescript
const lineCount = await readFileLineCount('./src/index.ts');
console.log(`File has ${lineCount} lines`);
```

### File Writing Operations

#### `writeJsonFile(file: string, content: unknown): Promise<void>`

Writes an object to a JSON file with pretty formatting (2-space indentation).

```typescript
const config = {
  name: 'my-app',
  version: '1.0.0',
  features: ['json5', 'yaml']
};

await writeJsonFile('./config.json', config);
```

### Directory Operations

#### `ensureDir(dir: string): Promise<void>`

Creates a directory and any necessary parent directories if they don't exist. Does nothing if the directory already exists.

```typescript
// Creates ./dist/assets/images and any missing parent directories
await ensureDir('./dist/assets/images');

// Safe to call multiple times
await ensureDir('./dist/assets/images'); // No error, does nothing
```

## Development

### Project Structure

```
fs-enhance/
├── src/
│   └── index.ts          # Main implementation
├── __tests__/
│   └── file-enhance.test.ts  # Test suite
├── package.json
├── tsconfig.json
└── README.md
```

### Running Tests

```bash
# Run tests
rush test --to @coze-arch/fs-enhance

# Run tests with coverage
rush test:cov --to @coze-arch/fs-enhance
```

### Building

```bash
# Type check
rush build --to @coze-arch/fs-enhance

# Lint code
rush lint --to @coze-arch/fs-enhance
```

## Dependencies

### Runtime Dependencies

- **json5** (^2.2.1) - JSON5 parsing support for relaxed JSON syntax
- **yaml** (^2.2.2) - YAML parsing and stringifying support

### Development Dependencies

- **@coze-arch/eslint-config** - Shared ESLint configuration
- **@coze-arch/ts-config** - Shared TypeScript configuration
- **@coze-arch/vitest-config** - Shared Vitest testing configuration
- **vitest** - Fast unit testing framework
- **@types/node** - TypeScript definitions for Node.js

## Error Handling

All functions handle errors gracefully:

- File existence checks (`isFileExists`, `isDirExists`) return `false` instead of throwing when files don't exist
- `ensureDir` safely handles existing directories without errors
- Parse operations will throw meaningful errors for invalid JSON/YAML syntax

## TypeScript Support

This package is written in TypeScript and provides full type definitions. Generic types are supported for parsing operations:

```typescript
// Strongly typed configuration
interface AppConfig {
  database: {
    host: string;
    port: number;
  };
  features: string[];
}

const config = await readJsonFile<AppConfig>('./app.config.json');
// config is fully typed as AppConfig
```

## License

Apache-2.0

---

**Note**: This package was extracted from rush-x utilities to provide reusable file system enhancements across the monorepo.
