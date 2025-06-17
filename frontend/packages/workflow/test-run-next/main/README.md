# @coze-workflow/test-run-next

Workflow TestRun 入口包

## Overview

This package is part of the Coze Studio monorepo and provides workflow functionality. It includes component, hook, store.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-workflow/test-run-next": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-workflow/test-run-next';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Component
- Hook
- Store

## API Reference

### Exports

- `/** components */
  TestRunForm,
  FormBaseFieldItem,
  FormBaseInputJson,
  FormBaseGroupCollapse,
  TestRunFormProvider,
  /** hooks */
  useForm,
  useTestRunFormStore,
  useFormSchema,
  useCurrentFieldState,
  /** functions */
  createSchemaField,
  generateField,
  generateFieldValidator,
  isFormSchemaPropertyEmpty,
  stringifyFormValuesFromBacked,
  FormSchema,
  /** constants */
  TestFormFieldName,
  /** types */
  type FormModel,
  type TestRunFormState,
  type IFormSchema,`
- `safeJsonParse`
- `TraceListPanel,
  TraceDetailPanel,`


For detailed API documentation, please refer to the TypeScript definitions.

## Development

This package is built with:

- TypeScript
- Modern JavaScript
- Vitest for testing
- ESLint for code quality

## Contributing

This package is part of the Coze Studio monorepo. Please follow the monorepo contribution guidelines.

## License

Apache-2.0
