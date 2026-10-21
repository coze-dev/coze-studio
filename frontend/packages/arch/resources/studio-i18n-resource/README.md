# @coze-studio/studio-i18n-resource-adapter

> Comprehensive internationalization (i18n) resource adapter for Coze Studio applications

This package provides a centralized internationalization resource adapter containing localized strings and type definitions for Coze Studio applications. It supports multiple languages and provides type-safe access to translation keys with parameter interpolation.

## Features

- 🌍 **Multi-language Support**: Currently supports English (`en`), Simplified Chinese (`zh-CN`) and Russian (`ru`, loaded on demand)
- 🔒 **Type Safety**: Comprehensive TypeScript definitions for all translation keys and parameters
- 📦 **Auto-generated**: Resources are automatically generated using the `dl-i18n` command
- ⚡ **React Integration**: Built-in support for React components with `ReactNode` parameter types
- 🎯 **Parameter Interpolation**: Support for dynamic content insertion with type-safe parameters
- 📝 **Extensive Coverage**: Over 13,000+ translation strings covering the entire Coze Studio ecosystem

## Get Started

### Installation

This package is part of the Coze Studio monorepo and should be installed via Rush:

```bash
# Add to your package.json dependencies
{
  "dependencies": {
    "@coze-studio/studio-i18n-resource-adapter": "workspace:*"
  }
}

# Install dependencies
rush update
```

### Basic Usage

```typescript
import { 
  localeEn, 
  localeZhCN, 
  defaultConfig,
  type I18nKeysHasOptionsType,
  type I18nKeysNoOptionsType 
} from '@coze-studio/studio-i18n-resource-adapter';

// Use individual locale data
console.log(localeEn.AddSuccessToast); // Access English translation
console.log(localeZhCN.AddSuccessToast); // Access Chinese translation

// Use default configuration object
const currentLocale = 'en';
const translations = defaultConfig[currentLocale].i18n;
```

### With i18n Libraries

```typescript
import { defaultConfig } from '@coze-studio/studio-i18n-resource-adapter';
import i18n from 'i18next';

// Initialize with react-i18next
i18n.init({
  resources: defaultConfig,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'i18n',
  interpolation: {
    escapeValue: false
  }
});
```

## API Reference

### Exports

#### `localeEn`
English locale data object containing all translation strings.

```typescript
import { localeEn } from '@coze-studio/studio-i18n-resource-adapter';

// Simple string access
const message = localeEn.account_login_success;
```

#### `localeZhCN`
Simplified Chinese locale data object containing all translation strings.

```typescript
import { localeZhCN } from '@coze-studio/studio-i18n-resource-adapter';

// Simple string access
const message = localeZhCN.account_login_success;
```

#### `loadLocaleRu`
Loads the Russian locale data object on demand. `ru.json` is a separate chunk and is not part of `defaultConfig`, so English and Chinese users do not download it. It may contain fewer keys than `localeEn`; `@coze-arch/i18n` falls back to English for the missing ones. Applications normally call `loadI18nResources` from `@coze-arch/i18n/raw`, which registers the result.

```typescript
import { loadLocaleRu } from '@coze-studio/studio-i18n-resource-adapter';

const localeRu = await loadLocaleRu();
const label = localeRu.settings_language_ru;
```

#### `defaultConfig`
Pre-configured object structure ready for use with i18n libraries.

```typescript
import { defaultConfig } from '@coze-studio/studio-i18n-resource-adapter';

// Structure: { [locale]: { i18n: translations } }
const config = defaultConfig;
// config.en.i18n contains English translations
// config['zh-CN'].i18n contains Chinese translations
// Russian is not included, see loadLocaleRu
```

### Type Definitions

#### `I18nKeysHasOptionsType`
Union type of all translation keys that require parameters for interpolation.

```typescript
import { type I18nKeysHasOptionsType } from '@coze-studio/studio-i18n-resource-adapter';

// Example keys that require parameters:
// - 'AddSuccessToast' (requires: { name: ReactNode })
// - 'Coze_token_body' (requires: { num: number })
// - 'account_merge_oauth_success2' (requires: { phone_number: string })
```

#### `I18nKeysNoOptionsType`
Union type of all translation keys that don't require parameters.

```typescript
import { type I18nKeysNoOptionsType } from '@coze-studio/studio-i18n-resource-adapter';

// Example keys without parameters:
// - 'account_login_success'
// - 'bot_create_success'
// - 'workflow_save_success'
```

#### `I18nOptionsMap`
Interface mapping each parameterized translation key to its required parameters.

```typescript
import { type I18nOptionsMap } from '@coze-studio/studio-i18n-resource-adapter';

// Type-safe parameter access
type AddSuccessParams = I18nOptionsMap['AddSuccessToast']; // { name: ReactNode }
type TokenBodyParams = I18nOptionsMap['Coze_token_body']; // { num: ReactNode }
```

#### `LocaleData`
Type definition for the structure of locale data objects.

```typescript
import { type LocaleData } from '@coze-studio/studio-i18n-resource-adapter';

// Use for typing custom locale objects
const customLocale: LocaleData = {
  // ... your translation keys
};
```

### Parameter Interpolation Examples

```typescript
import { localeEn, type I18nOptionsMap } from '@coze-studio/studio-i18n-resource-adapter';

// With react-i18next
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  // Type-safe parameter usage
  const successMessage = t('AddSuccessToast', { 
    name: 'My Bot' 
  } satisfies I18nOptionsMap['AddSuccessToast']);
  
  const tokenMessage = t('Coze_token_body', { 
    num: 100 
  } satisfies I18nOptionsMap['Coze_token_body']);
  
  return <div>{successMessage}</div>;
}
```

## Development

### Regenerating Resources

The locale files and type definitions are auto-generated. To update them:

```bash
# Run the i18n download command
pnpm dl-i18n
```

This will:
- Download the latest translations from the source
- Generate updated `en.json` and `zh-CN.json` files
- Regenerate the `locale-data.d.ts` type definitions
- Update the main `index.ts` export file

`ru.json` is maintained in this repository. If a regeneration rewrites `index.ts` without the `loadLocaleRu` export, add it back.

### Adding New Languages

To add support for additional languages:

1. Add the new locale JSON file to `src/locales/`
2. Import and export it in `src/index.ts`
3. Update the `defaultConfig` object to include the new locale
4. Regenerate types using `pnpm dl-i18n`

### Project Structure

```
src/
├── index.ts              # Main exports and default configuration
├── locale-data.d.ts      # Auto-generated TypeScript definitions
└── locales/
    ├── en.json          # English translations (~13K+ strings)
    ├── ru.json          # Russian translations (loaded on demand, missing keys fall back to en)
    └── zh-CN.json       # Chinese translations (~14K+ strings)
```

## Dependencies

### Runtime Dependencies
- No runtime dependencies (pure data package)

### Peer Dependencies
- `react` ~18.2.0 - Required for ReactNode type support
- `react-dom` ~18.2.0 - React DOM integration

### Development Dependencies
- `@coze-arch/eslint-config` - Linting configuration
- `@coze-arch/ts-config` - TypeScript configuration
- `@coze-arch/vitest-config` - Testing configuration
- `@types/node` ^18 - Node.js type definitions

## License

This package is part of the Coze Studio monorepo and follows the same licensing terms as the main project.

---

**Note**: This package is automatically generated and maintained. Direct modifications to locale files or type definitions will be overwritten during the next `dl-i18n` command execution.