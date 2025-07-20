# @coze-workflow/test-run-form

Workflow TestRun Form

## Overview

This package is part of the Coze Studio monorepo and provides workflow functionality. It includes component, store.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-workflow/test-run-form": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-workflow/test-run-form';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Component
- Store

## API Reference

### Exports

- `createSchemaField,
  useFormSchema,
  useForm,
  useCurrentFieldState,
  FormSchema,
  type FormModel,
  type IFormSchema,`
- `TestRunForm`
- `InputJson as FormBaseInputJson,
  GroupCollapse as FormBaseGroupCollapse,
  FieldItem as FormBaseFieldItem,`
- `TestRunFormProvider,
  useTestRunFormStore,
  type TestRunFormState,`
- `generateField,
  generateFieldValidator,
  isFormSchemaPropertyEmpty,
  stringifyFormValuesFromBacked,`
- `TestFormFieldName`


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
