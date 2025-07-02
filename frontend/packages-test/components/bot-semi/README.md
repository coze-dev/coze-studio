# @coze-arch/bot-semi

A comprehensive UI component library that provides wrapped and enhanced components based on SemiDesign UI framework. This package serves as the foundation UI layer for the Coze bot studio platform, offering both direct Semi UI re-exports and custom-styled components.

## Features

- **Enhanced Semi UI Components** - Custom-styled versions of Semi UI components with platform-specific theming
- **Direct Semi UI Re-exports** - Access to all Semi UI components through a single package
- **Custom Hooks** - Specialized hooks like `useGrab` for advanced UI interactions
- **TypeScript Support** - Full TypeScript definitions and type safety
- **Modular Exports** - Individual component imports for optimal bundle size
- **Platform Integration** - Built-in integration with Coze icons and internationalization

## Get Started

### Installation

Add the package to your project using workspace dependencies:

```json
{
  "dependencies": {
    "@coze-arch/bot-semi": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Basic Usage

Import components individually for optimal tree-shaking:

```tsx
import { UIButton, UIModal, useUIModal } from '@coze-arch/bot-semi';
import { Button, Input, Table } from '@coze-arch/bot-semi';

function MyComponent() {
  const modal = useUIModal();

  return (
    <div>
      <UIButton onClick={() => modal.show()}>
        Open Modal
      </UIButton>
      <UIModal {...modal.props}>
        Modal Content
      </UIModal>
    </div>
  );
}
```

## API Reference

### Enhanced UI Components

#### UIButton
Custom-styled button component with enhanced theming:

```tsx
import { UIButton } from '@coze-arch/bot-semi/Button';

<UIButton theme="solid" size="default">
  Click me
</UIButton>
```

#### UIModal
Enhanced modal with platform-specific styling and behavior:

```tsx
import { UIModal, useUIModal } from '@coze-arch/bot-semi/Modal';

const modal = useUIModal();

<UIModal
  type="info"
  showScrollBar={false}
  {...modal.props}
>
  Content
</UIModal>
```

#### UITable
Feature-rich table component with action integration:

```tsx
import { UITable, UITableAction } from '@coze-arch/bot-semi';

<UITable
  columns={columns}
  dataSource={data}
  renderActions={(record) => (
    <UITableAction
      items={[
        { key: 'edit', label: 'Edit' },
        { key: 'delete', label: 'Delete' }
      ]}
    />
  )}
/>
```

#### UIInput
Enhanced input component with platform styling:

```tsx
import { UIInput } from '@coze-arch/bot-semi/Input';

<UIInput
  placeholder="Enter text"
  size="default"
/>
```

### Form Components

#### UIFormInput, UIFormTextArea, UIFormSelect
Pre-configured form components:

```tsx
import { UIFormInput, UIFormTextArea, UIFormSelect } from '@coze-arch/bot-semi';

<Form>
  <UIFormInput field="name" label="Name" />
  <UIFormTextArea field="description" label="Description" />
  <UIFormSelect field="category" label="Category" options={options} />
</Form>
```

### Layout Components

#### UILayout
Platform-specific layout wrapper:

```tsx
import { UILayout } from '@coze-arch/bot-semi/Layout';

<UILayout header={<Header />} footer={<Footer />}>
  <Content />
</UILayout>
```

#### UITabBar
Enhanced tab navigation:

```tsx
import { UITabBar } from '@coze-arch/bot-semi';

<UITabBar
  tabs={[
    { key: 'tab1', label: 'Tab 1' },
    { key: 'tab2', label: 'Tab 2' }
  ]}
  activeKey="tab1"
  onChange={handleTabChange}
/>
```

### Utility Components

#### UIEmpty
Customized empty state component:

```tsx
import { UIEmpty } from '@coze-arch/bot-semi/Empty';

<UIEmpty
  image={UIEmpty.PRESENTED_IMAGE_SIMPLE}
  description="No data available"
/>
```

#### UITag
Enhanced tag component with color variants:

```tsx
import { UITag } from '@coze-arch/bot-semi/Tag';

<UITag color="blue" closable>
  Sample Tag
</UITag>
```

### Hooks

#### useGrab
Hook for drag-and-drop functionality:

```tsx
import { useGrab } from '@coze-arch/bot-semi';

const targetRef = useRef(null);
const { subscribeGrab, grabbing } = useGrab({
  grabTarget: targetRef,
  isModifyStyle: true,
  onPositionChange: ({ left, top }) => {
    console.log('Position:', { left, top });
  }
});

useEffect(() => {
  const unsubscribe = subscribeGrab();
  return unsubscribe;
}, []);
```

#### useUIModal
Hook for modal state management:

```tsx
import { useUIModal } from '@coze-arch/bot-semi';

const modal = useUIModal();

// Show modal
modal.show();

// Hide modal
modal.hide();

// Use props in component
<UIModal {...modal.props} />
```

### Semi UI Re-exports

All Semi UI components are available as direct imports:

```tsx
import {
  Button,
  Input,
  Table,
  Form,
  DatePicker,
  Select,
  // ... all other Semi UI components
} from '@coze-arch/bot-semi';
```

## Development

### Project Structure

```
src/
├── components/          # Enhanced UI components
│   ├── ui-button/      # Custom button implementation
│   ├── ui-modal/       # Custom modal implementation
│   ├── ui-table/       # Custom table implementation
│   └── ...
├── hooks/              # Custom hooks
│   └── use-grab.ts     # Drag and drop hook
├── semi/               # Semi UI re-exports
│   ├── index.ts        # Main re-export file
│   ├── button.ts       # Button types re-export
│   └── ...
└── utils/              # Utility functions
```

### Build Commands

```bash
# Type checking
rush ts-check

# Linting
rush lint

# Testing
rush test

# Test with coverage
rush test:cov
```

### Contributing

1. Follow the existing component patterns when adding new components
2. Ensure all components have proper TypeScript definitions
3. Add unit tests for new functionality
4. Follow the project's ESLint configuration

## Dependencies

### Runtime Dependencies
- **@douyinfe/semi-ui** - Core Semi Design UI framework
- **@douyinfe/semi-icons** - Semi Design icon library
- **@douyinfe/semi-illustrations** - Semi Design illustration library
- **@coze-arch/bot-icons** - Platform-specific icons
- **@coze-arch/i18n** - Internationalization support
- **react** - React framework
- **react-dom** - React DOM bindings
- **classnames** - CSS class utility
- **lodash-es** - Utility library
- **ahooks** - React hooks library

### Development Dependencies
- **@coze-arch/eslint-config** - ESLint configuration
- **@coze-arch/ts-config** - TypeScript configuration
- **@coze-arch/vitest-config** - Testing configuration
- **typescript** - TypeScript compiler
- **vitest** - Testing framework

## License

Apache-2.0 License

---

For more information about Semi Design components, visit the [Semi Design documentation](https://semi.design/).
