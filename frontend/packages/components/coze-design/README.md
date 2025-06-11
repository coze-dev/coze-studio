# @coze/coze-design

A comprehensive React design system built for Coze applications, providing a complete suite of UI components with modern design patterns, accessibility features, and internationalization support.

## Features

- 🎨 **Complete Component Library** - 50+ production-ready React components
- 🌗 **Dark/Light Theme Support** - Built-in theme provider with customizable themes
- 🌍 **Internationalization** - Multi-language support with locale providers
- ♿ **Accessibility First** - WCAG compliant components with proper ARIA attributes
- 🎯 **TypeScript Native** - Full TypeScript support with comprehensive type definitions
- 📱 **Responsive Design** - Mobile-first responsive components
- 🎪 **Storybook Integration** - Interactive component documentation and playground
- 🧪 **Testing Ready** - Comprehensive test coverage with testing utilities
- 🎭 **Icon & Illustration System** - Extensive icon and illustration libraries
- 🎨 **Color System** - Semantic color tokens with design system integration

## Get Started

### Installation

Install the package using your preferred package manager:

```bash
# Using pnpm (recommended for workspace)
pnpm add @coze/coze-design

# Using npm
npm install @coze/coze-design

# Using yarn
yarn add @coze/coze-design
```

### Workspace Installation

For development within the monorepo, add to your `package.json`:

```json
{
  "dependencies": {
    "@coze/coze-design": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

```tsx
import React from 'react';
import { 
  Button, 
  Input, 
  Avatar, 
  ThemeProvider,
  CDLocaleProvider 
} from '@coze/coze-design';

function App() {
  return (
    <ThemeProvider>
      <CDLocaleProvider locale="en_US">
        <div>
          <Avatar src="/avatar.jpg" alt="User Avatar" />
          <Input placeholder="Enter your message..." />
          <Button type="primary">Submit</Button>
        </div>
      </CDLocaleProvider>
    </ThemeProvider>
  );
}
```

## API Reference

### Core Components

#### Layout & Navigation
- **Layout** - Page layout components with header, content, footer
- **Menu** - Navigation menus with dropdown support
- **Breadcrumb** - Hierarchical navigation breadcrumbs
- **TabBar** - Tab navigation with panel management

#### Data Entry
- **Input** - Text input with validation and styling variants
- **InputNumber** - Numeric input with increment/decrement controls
- **InputCode** - Code input with syntax highlighting
- **TextArea** - Multi-line text input
- **Select** - Dropdown selection with search and multi-select
- **Checkbox** - Checkboxes with group support
- **Radio** - Radio buttons with group management
- **Switch** - Toggle switches
- **DatePicker** - Date and time selection
- **TimePicker** - Time-only selection
- **Search** - Search input with autocomplete
- **Cascader** - Hierarchical selection
- **TreeSelect** - Tree-based selection

#### Data Display
- **Table** - Feature-rich data tables with sorting, filtering, pagination
- **Typography** - Text components with semantic styling
- **Avatar** - User profile images with fallbacks
- **Badge** - Status indicators and counters
- **Tag** - Labels and categorization
- **Progress** - Progress indicators
- **EmptyState** - Empty state illustrations

#### Feedback
- **Modal** - Dialog overlays
- **Toast** - Notification messages
- **Popover** - Contextual overlays
- **Popconfirm** - Confirmation dialogs
- **Tooltip** - Informational tooltips
- **Loading** - Loading states and spinners
- **Banner** - Page-level messaging

#### General
- **Button** - Action buttons with variants (primary, secondary, AI, split)
- **Chip** - Compact information display
- **Collapse** - Collapsible content sections
- **Pagination** - Page navigation

### Specialized Features

#### Icons & Illustrations
```tsx
import { IconButton } from '@coze/coze-design/icons';
import { EmptyIllustration } from '@coze/coze-design/illustrations';
```

#### Color System
```tsx
import { 
  fgThemes, 
  bgThemes, 
  strokeThemes 
} from '@coze/coze-design/colors';
```

#### Localization
```tsx
import { CDLocaleProvider, zh_CN, en_US } from '@coze/coze-design/locales';

<CDLocaleProvider locale={zh_CN}>
  <App />
</CDLocaleProvider>
```

### Theme Customization

```tsx
import { ThemeProvider } from '@coze/coze-design';

const customTheme = {
  colors: {
    primary: '#1890ff',
    secondary: '#722ed1',
  },
  spacing: {
    unit: 8,
  },
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### Form Integration

```tsx
import { 
  FormInput, 
  FormSelect, 
  FormTextArea, 
  FormUpload 
} from '@coze/coze-design';

<Form>
  <FormInput name="username" label="Username" required />
  <FormSelect name="role" label="Role" options={roleOptions} />
  <FormTextArea name="description" label="Description" />
  <FormUpload name="avatar" label="Profile Picture" />
</Form>
```

## Development

### Prerequisites

- Node.js >= 18.2.0
- React >= 18.2.0
- pnpm (recommended)

### Local Development

```bash
# Install dependencies
rush update

# Start Storybook development server
npm run dev

# Build the package
npm run build

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint the code
npm run lint
```

### Storybook

The design system includes comprehensive Storybook documentation:

```bash
# Start Storybook
npm run dev

# Build Storybook for production
npm run build:storybook
```

Visit `http://localhost:6002` to explore components interactively.

### Component Generation

Create new components using the built-in generator:

```bash
npm run create
```

This will prompt you to create a new component with all necessary files including tests, stories, and documentation.

### Testing

The package includes comprehensive test coverage:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## Dependencies

### Core Dependencies
- **@douyinfe/semi-ui** (~2.72.3) - Base UI component library
- **React** (>=18.2.0) - UI framework
- **class-variance-authority** (^0.7.0) - Component variant management
- **tailwind-merge** (^1.13.2) - Tailwind CSS class merging
- **clsx** (^1.2.1) - Conditional class names
- **lodash-es** (^4.17.21) - Utility functions
- **date-fns** (^2.23.0) - Date manipulation
- **ahooks** (^3.7.8) - React hooks library

### Icon & Theme Dependencies
- **@coze-arch/arco-icon** (workspace:*) - Icon components
- **@coze-arch/arco-illustration** (workspace:*) - Illustration components
- **@coze-arch/semi-theme-hand01** (workspace:*) - Custom theme

### Development Dependencies
- **Storybook** (^7.6.7) - Component documentation and development
- **TypeScript** (~5.8.2) - Type checking
- **Vitest** (~3.0.5) - Testing framework
- **ESLint** - Code linting
- **Tailwind CSS** (~3.3.3) - Utility-first CSS

## Browser Support

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

ISC

---

For more information and examples, visit the [Storybook documentation](http://localhost:6002) or explore the component stories in the `src/components/*/stories/` directories.