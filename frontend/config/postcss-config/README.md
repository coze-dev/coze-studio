# @coze-arch/postcss-config

A shared PostCSS configuration for Coze architecture projects that provides a standardized set of PostCSS plugins for modern CSS preprocessing and Tailwind CSS integration.

## Features

- **PostCSS Import**: Process `@import` statements and inline imported files
- **Tailwind CSS Nesting**: Full support for CSS nesting with Tailwind CSS compatibility
- **Autoprefixer**: Automatic vendor prefixing for cross-browser compatibility
- **Modern CSS Support**: Enhanced pseudo-class support with `:is()` functionality
- **Zero Configuration**: Works out of the box with sensible defaults
- **Optimized Build**: Configured for both development and production workflows

## Get Started

### Installation

```bash
# Install as a workspace dependency
npm install @coze-arch/postcss-config@workspace:*

# Update rush dependencies
rush update
```

### Basic Usage

Create a `postcss.config.js` file in your project root:

```javascript
module.exports = require('@coze-arch/postcss-config');
```

Or extend the configuration:

```javascript
const baseConfig = require('@coze-arch/postcss-config');

module.exports = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    // Add your custom plugins here
    'postcss-custom-plugin': {},
  },
};
```

### Integration with Build Tools

#### Webpack

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader', // Will automatically use postcss.config.js
        ],
      },
    ],
  },
};
```

#### Vite

```javascript
// vite.config.js
export default {
  css: {
    postcss: require('@coze-arch/postcss-config'),
  },
};
```

#### Rsbuild

```javascript
// rsbuild.config.js
export default {
  tools: {
    postcss: require('@coze-arch/postcss-config'),
  },
};
```

## API Reference

### Default Configuration

The package exports a PostCSS configuration object with the following plugins:

```javascript
{
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    'tailwindcss': {},
    'autoprefixer': {},
    '@csstools/postcss-is-pseudo-class': {},
  }
}
```

### Plugin Details

#### postcss-import
- **Purpose**: Processes `@import` statements and inlines imported CSS files
- **Configuration**: Default settings (empty object)
- **Use Case**: Modular CSS organization and file imports

#### tailwindcss/nesting
- **Purpose**: Enables CSS nesting syntax compatible with Tailwind CSS
- **Configuration**: Uses `postcss-nesting` as the nesting implementation
- **Use Case**: Writing nested CSS with Tailwind utility classes

#### tailwindcss
- **Purpose**: Processes Tailwind CSS utility classes and directives
- **Configuration**: Default settings (reads from `tailwind.config.js`)
- **Use Case**: Utility-first CSS framework integration

#### autoprefixer
- **Purpose**: Automatically adds vendor prefixes to CSS properties
- **Configuration**: Default settings (uses browserslist configuration)
- **Use Case**: Cross-browser compatibility without manual prefixing

#### @csstools/postcss-is-pseudo-class
- **Purpose**: Transforms `:is()` pseudo-class for better browser support
- **Configuration**: Default settings
- **Use Case**: Modern CSS pseudo-class support in older browsers

### Customization Examples

#### Adding Custom Plugins

```javascript
const baseConfig = require('@coze-arch/postcss-config');

module.exports = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    'postcss-custom-properties': {
      preserve: false,
    },
    'cssnano': {
      preset: 'default',
    },
  },
};
```

#### Plugin Order Customization

```javascript
const baseConfig = require('@coze-arch/postcss-config');

module.exports = {
  plugins: {
    'postcss-import': baseConfig.plugins['postcss-import'],
    'custom-plugin': {},
    'tailwindcss/nesting': baseConfig.plugins['tailwindcss/nesting'],
    'tailwindcss': baseConfig.plugins['tailwindcss'],
    'autoprefixer': baseConfig.plugins['autoprefixer'],
    '@csstools/postcss-is-pseudo-class': baseConfig.plugins['@csstools/postcss-is-pseudo-class'],
  },
};
```

## Development

### Project Structure

```
config/postcss-config/
├── src/
│   └── index.js          # Main configuration export
├── package.json          # Package configuration
├── eslint.config.js      # ESLint configuration
├── tsconfig.*.json       # TypeScript configurations
└── README.md            # This file
```

### Development Commands

```bash
# Lint the code
rush lint

# Run all checks
rush build
```

### Contributing

1. Follow the existing code style and configuration patterns
2. Ensure all linting passes before submitting changes
3. Test the configuration with actual PostCSS processing
4. Update documentation for any configuration changes

## Dependencies

### Runtime Dependencies

- **postcss**: Core PostCSS processor
- **postcss-import**: Import processing plugin
- **postcss-loader**: Webpack integration
- **postcss-nesting**: CSS nesting support
- **@tailwindcss/nesting**: Tailwind-compatible nesting
- **@csstools/postcss-is-pseudo-class**: Modern pseudo-class support

### Development Dependencies

- **@coze-arch/eslint-config**: Shared ESLint configuration
- **@coze-arch/ts-config**: Shared TypeScript configuration
- **@types/node**: Node.js type definitions

## License

Internal use within Coze architecture projects.