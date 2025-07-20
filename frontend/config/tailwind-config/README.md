# @coze-arch/tailwind-config

A comprehensive Tailwind CSS configuration package for the Coze design system, providing consistent theming, color palettes, and semantic design tokens across all applications.

## Features

- 🎨 **Complete Design System**: Pre-configured colors, spacing, typography, and component styles
- 🌙 **Dark Mode Support**: Built-in light/dark theme switching with CSS variables
- 🎯 **Semantic Classes**: Meaningful utility classes like `coz-fg-primary`, `coz-bg-secondary`
- 🧩 **Component-Ready**: Pre-defined styles for buttons, inputs, and other UI components
- 🎨 **Rich Color Palette**: Extensive color system including brand, functional, and semantic colors
- 📐 **Consistent Spacing**: Standardized spacing system across all dimensions
- 🔧 **Design Token Integration**: Support for converting design tokens to Tailwind config

## Get Started

### Installation

```bash
# Install the package in your workspace
pnpm add @coze-arch/tailwind-config@workspace:*

# Update Rush to install dependencies
rush update
```

### Basic Usage

In your `tailwind.config.js`:

```javascript
const cozeConfig = require('@coze-arch/tailwind-config');

module.exports = {
  ...cozeConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // your content paths
  ],
  // extend or override as needed
  theme: {
    extend: {
      ...cozeConfig.theme.extend,
      // your custom extensions
    },
  },
};
```

### Using the Coze Plugin

For semantic utilities and CSS variables:

```javascript
const cozePlugin = require('@coze-arch/tailwind-config/coze');

module.exports = {
  // ... your config
  plugins: [
    cozePlugin,
    // other plugins
  ],
};
```

### Design Token Integration

Convert design tokens to Tailwind configuration:

```javascript
import { designTokenToTailwindConfig, getPackagesContents } from '@coze-arch/tailwind-config/design-token';

const tokenConfig = designTokenToTailwindConfig(yourDesignTokens);

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    ...getPackagesContents(), // Auto-discover package contents
  ],
  theme: {
    extend: tokenConfig,
  },
};
```

## API Reference

### Main Configuration

The default export provides a complete Tailwind configuration with:

#### Colors

```javascript
// Brand colors
'text-brand-5'         // Primary brand color
'bg-brand-1'           // Light brand background
'border-brand-3'       // Brand border

// Semantic colors
'text-foreground-3'    // Primary text
'text-foreground-2'    // Secondary text
'bg-background-1'      // Primary background
'bg-background-0'      // Secondary background

// Functional colors
'text-red-5'           // Error/danger
'text-yellow-5'        // Warning
'text-green-5'         // Success
```

#### Spacing & Sizing

```javascript
// Semantic spacing
'p-normal'             // 32px padding
'm-small'              // 20px margin
'gap-mini'             // 16px gap

// Precise spacing
'w-320px'              // 320px width
'h-240px'              // 240px height
'p-24px'               // 24px padding
```

#### Typography

```javascript
// Font sizes
'text-mini'            // 10px
'text-base'            // 12px
'text-lg'              // 14px
'text-xl'              // 15px
'text-xxl'             // 16px
'text-24px'            // 24px
```

### Coze Plugin

The Coze plugin adds semantic utility classes and CSS variables:

```javascript
// Semantic foreground classes
'coz-fg-primary'       // Primary text color
'coz-fg-secondary'     // Secondary text color
'coz-fg-hglt'          // Highlight text color

// Semantic background classes
'coz-bg-primary'       // Primary background
'coz-bg-secondary'     // Secondary background
'coz-mg-hglt'          // Highlight background

// Component-specific classes
'coz-btn-rounded-normal'    // Button border radius
'coz-input-height-large'    // Input height
'coz-shadow-large'          // Large shadow
```

### Design Token Functions

#### `designTokenToTailwindConfig(tokenJson)`

Converts design tokens to Tailwind configuration:

```javascript
const tokenConfig = designTokenToTailwindConfig({
  palette: {
    light: { 'primary-500': '#3b82f6' },
    dark: { 'primary-500': '#60a5fa' }
  },
  tokens: {
    color: {
      light: { 'primary-color': 'var(primary-500)' },
      dark: { 'primary-color': 'var(primary-500)' }
    },
    spacing: {
      'spacing-sm': '8px',
      'spacing-md': '16px'
    }
  }
});
```

#### `getPackagesContents(subPath?)`

Auto-discovers package source files for content configuration:

```javascript
const contents = getPackagesContents();
// Returns: [
//   '/path/to/package1/src/**/*.{ts,tsx}',
//   '/path/to/package2/src/**/*.{ts,tsx}',
//   ...
// ]
```

## Development

### Project Structure

```
src/
├── index.js           # Main Tailwind configuration
├── coze.js           # Coze plugin with semantic utilities
├── design-token.ts   # Design token conversion utilities
├── light.js          # Light theme CSS variables
└── dark.js           # Dark theme CSS variables
```

### Theme System

The package uses CSS variables for theming:

```css
:root {
  --coze-brand-5: 81, 71, 255;
  --coze-fg-3: 15, 21, 40;
  --coze-bg-1: 247, 247, 252;
}

.dark {
  --coze-brand-5: 166, 166, 255;
  --coze-fg-3: 255, 255, 255;
  --coze-bg-1: 24, 28, 43;
}
```

Colors are defined as RGB values to support alpha transparency:

```css
.text-brand-5 {
  color: rgba(var(--coze-brand-5), 1);
}

.bg-brand-1 {
  background-color: rgba(var(--coze-brand-1), var(--coze-brand-1-alpha));
}
```

### Adding New Colors

1. Add the RGB values to `light.js` and `dark.js`
2. Add alpha values for transparency support
3. Update the main configuration in `index.js`
4. Add semantic classes to `coze.js` if needed

### Testing

```bash
# Run linting
pnpm lint

# Build (no-op for this package)
pnpm build
```

## Dependencies

### Runtime Dependencies

- **tailwindcss** (~3.3.3) - Core Tailwind CSS framework
- **@tailwindcss/forms** (^0.5.7) - Form styling plugin
- **@tailwindcss/nesting** (latest) - CSS nesting support
- **postcss** (^8.4.32) - CSS transformation tool
- **postcss-loader** (^7.3.3) - Webpack PostCSS loader
- **autoprefixer** (^10.4.16) - CSS vendor prefixing

### Development Dependencies

- **@coze-arch/eslint-config** (workspace:*) - Shared ESLint configuration
- **@coze-arch/ts-config** (workspace:*) - Shared TypeScript configuration
- **@types/node** (^18) - Node.js type definitions

## License

This package is part of the Coze architecture and follows the project's licensing terms.