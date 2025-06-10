# @coze-arch/arco-illustration

A React-based illustration component library providing SVG icons for Coze applications. This package includes file type icons and various illustration states (empty states, error states, success states, etc.) with both light and dark theme support.

## Features

- **🎨 Rich Icon Set**: Comprehensive collection of file type icons (PDF, DOCX, image, video, etc.) and state illustrations
- **🌓 Dark Mode Support**: Each illustration comes with both light and dark variants
- **⚛️ React Compatible**: Built with React and TypeScript for seamless integration
- **🎯 Customizable**: Support for custom sizing, colors, and CSS classes
- **♿ Accessible**: Proper SVG structure with accessibility support
- **🔄 Context Support**: Built-in React context for global configuration

## Get Started

### Installation

This package is part of the bot-studio monorepo. Install it using the workspace protocol:

```bash
# Add to your package.json dependencies
"@coze-arch/arco-illustration": "workspace:*"

# Then run rush update to install
rush update
```

### Basic Usage

```tsx
import { IconCozFileImage, IconCozIllusEmpty, IconCozIllus404 } from '@coze-arch/arco-illustration';

function MyComponent() {
  return (
    <div>
      {/* File type icon */}
      <IconCozFileImage width="24" height="24" />
      
      {/* Empty state illustration */}
      <IconCozIllusEmpty width="200" height="200" />
      
      {/* 404 error state */}
      <IconCozIllus404 width="300" height="300" />
    </div>
  );
}
```

### Dark Mode Support

Most illustrations have dark mode variants:

```tsx
import { 
  IconCozIllusEmpty, 
  IconCozIllusEmptyDark,
  IconCozIllusError,
  IconCozIllusErrorDark 
} from '@coze-arch/arco-illustration';

function ThemeAwareComponent({ isDark }) {
  return (
    <div>
      {isDark ? (
        <IconCozIllusEmptyDark width="200" height="200" />
      ) : (
        <IconCozIllusEmpty width="200" height="200" />
      )}
    </div>
  );
}
```

## API Reference

### IconProps

All icon components accept the following props:

```tsx
interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Custom CSS class name */
  className?: string;
  /** Icon prefix for CSS classes (default: 'illustration') */
  prefix?: string;
  /** Icon width (default: '1em') */
  width?: string;
  /** Icon height (default: '1em') */
  height?: string;
  /** Use currentColor for fill (default: false) */
  useCurrentColor?: boolean;
  /** Enable spin animation (default: false) */
  spin?: boolean;
}
```

### Available Icons

#### File Type Icons
- `IconCozFileAudio` - Audio file icon
- `IconCozFileCode` - Code file icon  
- `IconCozFileCsv` - CSV file icon
- `IconCozFileDocx` - Word document icon
- `IconCozFileImage` - Image file icon
- `IconCozFileOther` - Generic file icon
- `IconCozFilePdf` - PDF file icon
- `IconCozFilePptx` - PowerPoint file icon
- `IconCozFileTxt` - Text file icon
- `IconCozFileVideo` - Video file icon
- `IconCozFileXlsx` - Excel file icon
- `IconCozFileZip` - ZIP archive icon

#### State Illustrations (with dark variants)
- `IconCozIllus404` / `IconCozIllus404Dark` - 404 error state
- `IconCozIllusAdd` / `IconCozIllusAddDark` - Add/create state
- `IconCozIllusDone` / `IconCozIllusDoneDark` - Success/completion state
- `IconCozIllusEmpty` / `IconCozIllusEmptyDark` - Empty state
- `IconCozIllusError` / `IconCozIllusErrorDark` - Error state
- `IconCozIllusLock` / `IconCozIllusLockDark` - Locked/restricted state
- `IconCozIllusNoNetwork` / `IconCozIllusNoNetworkDark` - No network state
- `IconCozIllusNone` / `IconCozIllusNoneDark` - No content state

### Context Configuration

Use the provided context to set global defaults:

```tsx
import { Context } from '@coze-arch/arco-illustration';

function App() {
  return (
    <Context.Provider value={{ prefix: 'my-custom-prefix' }}>
      <YourComponents />
    </Context.Provider>
  );
}
```

### Styling Examples

```tsx
// Custom sizing
<IconCozFileImage width="48" height="48" />

// Custom styling with currentColor
<IconCozFileImage 
  useCurrentColor={true} 
  style={{ color: '#1890ff' }}
/>

// Adding custom CSS classes
<IconCozFileImage 
  className="file-icon file-icon--large" 
/>

// Spin animation
<IconCozIllusAdd spin={true} />
```

## Development

### Building

```bash
# Type checking (no actual build needed - exports source TS)
rush build --to @coze-arch/arco-illustration
```

### Linting

```bash
# Run ESLint
rushx lint

# Auto-fix linting issues  
rushx lint --fix
```

### Testing

```bash
# Run tests (currently placeholder)
rushx test
```

### File Structure

```
src/
├── index.ts              # Main exports
├── type.ts               # TypeScript type definitions
├── context.ts            # React context for configuration
├── IconCozFileAudio/     # Individual icon components
│   └── index.tsx
├── IconCozFileImage/
│   └── index.tsx
└── ... (other icon directories)
```

## Dependencies

### Runtime Dependencies
- `react` ~18.2.0 - Core React library

### Development Dependencies
- `@coze-arch/eslint-config` - Shared ESLint configuration
- `@coze-arch/ts-config` - Shared TypeScript configuration
- `@types/react` 18.2.37 - React type definitions
- `typescript` ~5.8.2 - TypeScript compiler

## License

ISC

---

For questions or contributions, please contact the maintainers listed in the OWNERS file.