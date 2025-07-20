# @coze-arch/stylelint-config

A comprehensive and opinionated stylelint configuration package designed for Coze's frontend projects. This package provides a standardized set of CSS/Less linting rules that enforce consistent code style, maintainability, and best practices across the codebase.

## Features

- 🔧 **Pre-configured Rules**: Built on top of industry-standard configurations including `stylelint-config-standard`, `stylelint-config-standard-less`, and `stylelint-config-clean-order`
- 📏 **BEM-style Class Naming**: Enforces `$block-$element_$modifier` naming pattern for CSS classes
- 🏗️ **Nesting Control**: Limits CSS nesting depth to 3 levels for better readability and performance
- 🚫 **Custom Rules**: Includes custom plugins to prevent first-level `:global` selectors and enforce coding standards
- 🎨 **Less Support**: Full support for Less syntax and variables
- 📋 **Property Ordering**: Automatic CSS property ordering for consistent code structure
- ⚡ **Tailwind Compatible**: Configured to work seamlessly with Tailwind CSS

## Get Started

### Installation

Add the package to your project:

```bash
# In your project's package.json
{
  "devDependencies": {
    "@coze-arch/stylelint-config": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

Create a `.stylelintrc.js` file in your project root:

```javascript
const { defineConfig } = require('@coze-arch/stylelint-config');

module.exports = defineConfig({
  extends: [],
  rules: {
    // Add your custom rules here
  }
});
```

Or use the configuration directly:

```javascript
module.exports = {
  extends: ['@coze-arch/stylelint-config']
};
```

## API Reference

### `defineConfig(config)`

The main configuration function that extends the base stylelint configuration.

**Parameters:**
- `config` (Config): Stylelint configuration object

**Returns:**
- `Config`: Extended stylelint configuration

**Example:**

```javascript
const { defineConfig } = require('@coze-arch/stylelint-config');

module.exports = defineConfig({
  extends: ['stylelint-config-recommended-scss'],
  rules: {
    'color-hex-length': 'long',
    'declaration-block-trailing-semicolon': 'always'
  },
  ignoreFiles: ['dist/**/*']
});
```

## Configuration Rules

### Class Naming Pattern

The configuration enforces BEM-style class naming with the pattern: `$block-$element_$modifier`

```css
/* ✅ Good */
.button { }
.button-large { }
.button-large_disabled { }
.nav-item { }
.nav-item_active { }

/* ❌ Bad */
.Button { }
.button_large_disabled { }
.nav-item-active-disabled { }
.camelCaseClass { }
```

### Nesting Depth

Maximum nesting depth is limited to 3 levels (excluding pseudo-classes):

```less
/* ✅ Good */
.component {
  .header {
    .title {
      color: blue;
    }
  }
}

/* ❌ Bad */
.component {
  .header {
    .title {
      .text {
        .span { // Too deep!
          color: blue;
        }
      }
    }
  }
}
```

### Global Selectors

First-level `:global` selectors are disallowed:

```less
/* ❌ Bad */
:global {
  .some-class {
    color: red;
  }
}

/* ✅ Good */
.component {
  :global {
    .some-class {
      color: red;
    }
  }
}
```

### Important Declarations

The use of `!important` is prohibited:

```css
/* ❌ Bad */
.class {
  color: red !important;
}

/* ✅ Good */
.class {
  color: red;
}
```

## Examples

### Basic Less File

```less
// Good example following all rules
.card {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;

  &-header {
    margin-bottom: 12px;
    font-weight: bold;

    &_featured {
      background-color: #f0f0f0;
    }
  }

  &-content {
    line-height: 1.5;
  }
}
```

### With Tailwind Classes

```less
.custom-component {
  @apply flex items-center justify-between;

  &-item {
    @apply px-4 py-2 rounded;

    &_active {
      @apply bg-blue-500 text-white;
    }
  }
}
```

## Development

### Running Examples

Test the configuration against example files:

```bash
rush stylelint-config example
```

This will run stylelint against the files in the `examples/` directory.

### Custom Rules

The package includes a custom plugin located at `plugins/plugin-disallow-nesting-level-one-global.js` that prevents first-level `:global` selectors.

## Dependencies

### Runtime Dependencies
This package has no runtime dependencies.

### Development Dependencies
- **stylelint**: ^15.11.0 - Core stylelint engine
- **stylelint-config-standard**: ^34.0.0 - Standard CSS rules
- **stylelint-config-standard-less**: ^2.0.0 - Less-specific rules
- **stylelint-config-clean-order**: ^5.2.0 - CSS property ordering
- **stylelint-config-rational-order**: ^0.1.2 - Alternative property ordering
- **sucrase**: ^3.32.0 - TypeScript compilation

## License

Apache-2.0 License

---

For more information about stylelint configuration options, visit the [official stylelint documentation](https://stylelint.io/user-guide/configuration/).
