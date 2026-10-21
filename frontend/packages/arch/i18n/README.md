# @coze-arch/i18n

A comprehensive internationalization (i18n) solution for the Coze platform, providing unified text localization and language management across all applications in the monorepo.

## Features

- **🌍 Multi-language Support**: Built-in support for English, Chinese (Simplified) and Russian with easy extensibility
- **🎯 Type-safe Translations**: Full TypeScript support with auto-generated types for translation keys
- **⚡ Multiple Integration Modes**: Support for both Eden.js projects and standalone applications
- **🔌 Plugin Architecture**: Extensible plugin system with language detection and ICU formatting
- **📱 React Integration**: Built-in React provider and context for seamless component integration
- **🛡️ Fallback Handling**: Robust fallback mechanisms for missing translations
- **🎨 Design System Integration**: Seamless integration with Coze Design components

## Get Started

### Installation

Add the package to your project:

```json
{
  "dependencies": {
    "@coze-arch/i18n": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

#### For Eden.js Projects

Configure in your `edenx.config.ts`:

```typescript
import { locale } from '@coze-arch/i18n/locales';

export default {
  intl: {
    mode: 'offline',
    clientOptions: {
      namespace: 'i18n',
    },
    intlOptions: {
      fallbackLng: 'en',
      ns: 'i18n',
      lng: 'en',
      resources: locale,
    },
  },
};
```

Use in your components:

```typescript
import { I18n } from '@coze-arch/i18n';

function MyComponent() {
  const title = I18n.t('common.title');
  const greeting = I18n.t('common.greeting', { name: 'User' });

  return <h1>{title}</h1>;
}
```

#### For Standalone Applications

Initialize before rendering:

```typescript
import { initI18nInstance, I18n } from '@coze-arch/i18n/raw';
import { createRoot } from 'react-dom/client';

initI18nInstance({
  lng: 'en',
  ns: 'i18n'
}).then(() => {
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
});
```

Use translations:

```typescript
import { I18n } from '@coze-arch/i18n/raw';

function App() {
  const message = I18n.t('welcome.message');
  return <div>{message}</div>;
}
```

#### React Provider Integration

```typescript
import { I18nProvider } from '@coze-arch/i18n/i18n-provider';
import { I18n } from '@coze-arch/i18n';

function App() {
  return (
    <I18nProvider i18n={I18n}>
      <YourComponents />
    </I18nProvider>
  );
}
```

## API Reference

### Core I18n Instance

#### `I18n.t(key, options?, fallback?)`

Translate a text key with optional interpolation and fallback.

```typescript
// Basic translation
I18n.t('common.save')

// With interpolation
I18n.t('user.greeting', { name: 'John' })

// With fallback
I18n.t('missing.key', {}, 'Default text')
```

#### `I18n.setLang(language, callback?)`

Change the current language.

```typescript
I18n.setLang('zh-CN', () => {
  console.log('Language changed');
});
```

#### `I18n.setLangWithPromise(language)`

Change language with Promise-based API.

```typescript
await I18n.setLangWithPromise('en');
```

#### `I18n.language`

Get the current language.

```typescript
const currentLang = I18n.language; // 'en' | 'zh-CN' | 'ru' | 'ru-RU'
```

#### `I18n.getLanguages()`

Get available languages.

```typescript
const languages = I18n.getLanguages(); // ['zh-CN', 'zh', 'en-US']
```

#### `I18n.dir()`

Get text direction for current language.

```typescript
const direction = I18n.dir(); // 'ltr' | 'rtl'
```

### Initialization Functions

#### `initI18nInstance(config?)`

Initialize i18n for standalone applications.

```typescript
interface I18nConfig {
  lng: 'en' | 'zh-CN' | 'ru' | 'ru-RU';
  ns?: string;
  // Additional i18next options
}

await initI18nInstance({
  lng: 'en',
  ns: 'i18n'
});
```

Keys missing in the current language fall back to the init language (English when the init language is Russian). Russian (`ru`, or `ru-RU`, which resolves to the `ru` resource) always falls back to English, also after a runtime `I18n.setLang('ru-RU')`.

#### `loadI18nResources(lng)`

Russian is not bundled with English and Chinese: its dictionary is a separate chunk that only Russian users download. Wait for `loadI18nResources` before calling `initI18nInstance` or `I18n.setLang` with `ru` or `ru-RU`. It resolves to `true` once the resources are registered (at once for the bundled languages) and to `false` when the download fails; use `en` in that case. Repeated calls share one download.

```typescript
import { initI18nInstance, loadI18nResources } from '@coze-arch/i18n/raw';

const lng = 'ru-RU';
const isLoaded = await loadI18nResources(lng);
await initI18nInstance({ lng: isLoaded ? lng : 'en' });
```

### React Components

#### `I18nProvider`

React context provider for i18n integration.

```typescript
interface I18nProviderProps {
  children?: ReactNode;
  i18n: Intl;
}
```

### Type Utilities

#### `I18nKeysNoOptionsType`

Type for translation keys that don't require interpolation options.

#### `I18nKeysHasOptionsType`

Type for translation keys that require interpolation options.

## Development

### Updating Translations

Pull the latest translations from the remote source:

```bash
rush pull-i18n
```

This will update the locale files in `src/resource/locales/`.

### Adding New Locale Keys

1. Add new keys to the remote translation system
2. Run `rush pull-i18n` to sync locally
3. The TypeScript types will be automatically updated

### Testing

Run the test suite:

```bash
rushx test
```

Run tests with coverage:

```bash
rushx test:cov
```

### Project Structure

```
src/
├── index.ts              # Main export for Eden.js projects
├── raw/                  # Standalone application exports
├── i18n-provider/        # React context provider
├── intl/                 # Core i18n implementation
├── resource/             # Locale data and resources
└── global.d.ts          # Global type definitions
```

## Dependencies

### Core Dependencies

- **i18next**: Core internationalization framework
- **i18next-browser-languagedetector**: Automatic language detection in browsers
- **i18next-icu**: ICU message formatting support
- **@coze-studio/studio-i18n-resource-adapter**: Internal resource adapter for locale data
- **@coze-arch/coze-design**: Design system integration

### Peer Dependencies

- **react**: React framework support
- **react-dom**: React DOM rendering

## License

Internal package - ByteDance Ltd.

---

For questions or support, please contact the Coze Architecture team.
