# @coze-arch/arco-icon

A comprehensive collection of over 490 React SVG icons designed for Coze platform applications, generated from Design System Management (DSM). This package provides clean, scalable icons with consistent styling and modern React TypeScript support.

## Features

- 🎨 **490+ Icons** - Extensive collection of purpose-built icons for AI, chat, workflow, and general UI needs
- ⚛️ **React Ready** - TypeScript support with proper prop types and ref forwarding
- 🎯 **Coze-Specific** - Icons designed specifically for AI chat bots, workflows, plugins, and platform features
- 🔧 **Customizable** - Support for custom sizing, colors, className, and CSS properties
- 🌈 **Theme Aware** - Uses currentColor by default for easy theme integration
- 📦 **Tree Shakable** - Import only the icons you need
- 🌀 **Loading Animation** - Built-in spin animation support for loading states

## Get Started

### Installation

```bash
# In the bot-studio-monorepo workspace
rush update
```

### Basic Usage

```tsx
import { IconCozChat, IconCozBot, IconCozLoading } from '@coze-arch/arco-icon';

function MyComponent() {
  return (
    <div>
      <IconCozChat width="24px" height="24px" />
      <IconCozBot className="text-blue-500" />
      <IconCozLoading spin width="16px" />
    </div>
  );
}
```

### Context Provider

Configure default icon prefix globally:

```tsx
import { Context } from '@coze-arch/arco-icon';

function App() {
  return (
    <Context.Provider value={{ prefix: 'my-icon' }}>
      {/* All icons will use 'my-icon' prefix for CSS classes */}
      <YourComponents />
    </Context.Provider>
  );
}
```

## API Reference

### IconProps

All icons accept the following props:

```tsx
interface IconProps {
  // Standard SVG props
  className?: string;
  width?: string;
  height?: string;
  
  // Icon-specific props
  prefix?: string;           // CSS class prefix (default: 'icon')
  useCurrentColor?: boolean; // Use currentColor for fill (default: true)
  spin?: boolean;           // Add spinning animation (default: false)
  
  // All other SVGSVGElement props
  onClick?: () => void;
  style?: React.CSSProperties;
  // ... etc
}
```

### Icon Categories

The package includes icons organized by categories:

#### Chat & Communication
- `IconCozChat`, `IconCozChatFill` - Basic chat icons
- `IconCozChatPlus`, `IconCozChatStar` - Enhanced chat features
- `IconCozComment`, `IconCozReply` - Messaging actions

#### AI & Bots
- `IconCozBot`, `IconCozBotFill` - Generic bot icons
- `IconCozAi`, `IconCozAiFill` - AI-specific icons
- `IconCozMultiAgent`, `IconCozSingleAgent` - Agent types

#### Workflow & Actions
- `IconCozWorkflow`, `IconCozWorkflowFill` - Workflow management
- `IconCozNode`, `IconCozNodeFill` - Workflow nodes
- `IconCozPlay`, `IconCozPause` - Control actions

#### File & Data
- `IconCozDocument`, `IconCozFolder` - File management
- `IconCozImage`, `IconCozCode` - Content types
- `IconCozDatabase`, `IconCozKnowledge` - Data sources

#### UI Controls
- `IconCozArrowLeft`, `IconCozArrowRight` - Navigation
- `IconCozPlus`, `IconCozMinus` - Add/remove actions
- `IconCozEdit`, `IconCozCopy` - Common actions

### Examples

#### Basic Icon Usage
```tsx
import { IconCozBot } from '@coze-arch/arco-icon';

<IconCozBot 
  width="32px" 
  height="32px" 
  className="text-blue-600 hover:text-blue-800" 
/>
```

#### Loading Spinner
```tsx
import { IconCozLoading } from '@coze-arch/arco-icon';

<IconCozLoading 
  spin 
  width="20px" 
  className="text-gray-500" 
/>
```

#### Custom Styling
```tsx
import { IconCozChat } from '@coze-arch/arco-icon';

<IconCozChat
  width="24px"
  style={{ 
    color: '#3B82F6',
    cursor: 'pointer',
    transition: 'color 0.2s'
  }}
  onClick={() => console.log('Chat clicked')}
/>
```

#### With Custom Prefix
```tsx
import { IconCozWorkflow } from '@coze-arch/arco-icon';

<IconCozWorkflow 
  prefix="my-app"
  width="20px"
  // This will generate CSS classes: my-app-icon my-app-icon-coz_workflow
/>
```

## Development

### Building
```bash
cd packages/arch/arco-icon
rush build
```

### Linting
```bash
cd packages/arch/arco-icon
rush lint
```

### Adding New Icons
Icons are generated from the Design System Management (DSM). To add new icons:

1. Add icons to the DSM system at https://semi.design/dsm/
2. Regenerate the package using the DSM build process
3. Update exports in `src/index.ts`

## Dependencies

- **react**: ~18.2.0 - React framework for component rendering
- **@coze-arch/eslint-config**: workspace:* - ESLint configuration
- **@coze-arch/ts-config**: workspace:* - TypeScript configuration

## License

ISC - Internal package for Coze platform development.