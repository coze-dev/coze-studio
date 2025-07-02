# @coze-arch/bot-typings

A comprehensive TypeScript type definitions package extracted from the bot application, providing essential type declarations for the Coze bot platform. This package centralizes common type definitions, interfaces, and module declarations to ensure type safety across the bot ecosystem.

## Features

- **Global Type Declarations**: Provides type definitions for various file formats (images, stylesheets, SVG)
- **Common Utility Types**: Includes utility types like `Expand`, `PartialRequired`, and `Obj` for enhanced type manipulation
- **Platform-Specific Types**: Defines interfaces for browser APIs, window objects, and navigator extensions
- **User & Authentication Types**: Comprehensive type definitions for user data, authentication flows, and OAuth
- **Teamspace & Routing Types**: Type definitions for dynamic routing parameters and teamspace functionality
- **Zero Runtime Impact**: Pure TypeScript declarations with no runtime dependencies

## Get Started

### Installation

Install the package in your Rush.js monorepo:

```bash
# Add to your package.json
"@coze-arch/bot-typings": "workspace:*"

# Run Rush update to install
rush update
```

### Basic Usage

Import the main type definitions:

```typescript
// Import the main type definitions
import "@coze-arch/bot-typings";

// Import specific modules
import { BotPageFromEnum, Obj, Expand, PartialRequired } from "@coze-arch/bot-typings/common";
import { DynamicParams } from "@coze-arch/bot-typings/teamspace";
```

## API Reference

### Common Types

#### `BotPageFromEnum`
Defines the source of bot detail pages:

```typescript
enum BotPageFromEnum {
  Bot = 'bot',        // Bot list
  Explore = 'explore', // Explore list
  Store = 'store',
  Template = 'template',
}
```

#### Utility Types

**`Obj`** - Generic object type:
```typescript
type Obj = Record<string, any>;
```

**`Expand<T>`** - Expands intersection types for better readability:
```typescript
type Intersection = { a: string } & { b: number };
type Result = Expand<Intersection>;
// Result: { a: string; b: number }
```

**`PartialRequired<T, K>`** - Makes specific fields required:
```typescript
interface Agent {
  id?: string;
  name?: string;
  desc?: string;
}
type Result = PartialRequired<Agent, 'id' | 'name'>;
// Result: { id: string; name: string; desc?: string }
```

### Teamspace Types

#### `DynamicParams`
Defines route parameters for teamspace navigation:

```typescript
interface DynamicParams extends Record<string, string | undefined> {
  space_id?: string;
  bot_id?: string;
  plugin_id?: string;
  workflow_id?: string;
  dataset_id?: string;
  doc_id?: string;
  tool_id?: string;
  invite_key?: string;
  product_id?: string;
  mock_set_id?: string;
  conversation_id: string; // Required
  commit_version?: string;
  scene_id?: string;
  post_id?: string;
  project_id?: string;
}
```

### User & Authentication Types

The package provides comprehensive types under the `DataItem` namespace:

#### `UserInfo`
Complete user information interface:
```typescript
interface UserInfo {
  user_id_str: string;
  name: string;
  screen_name: string;
  avatar_url: string;
  email?: string;
  // ... many more fields
}
```

#### Authentication Types
- `AuthLoginParams` - OAuth login parameters
- `AuthorizeResponse` - Authorization response structure
- `SendCodeData` - Verification code response
- `UserCheckResponse` - User validation response

### Global Module Declarations

The package automatically provides type declarations for:

**Image Files:**
```typescript
// .jpeg, .jpg, .webp, .gif, .png files
import myImage from './image.png'; // string
```

**Stylesheets:**
```typescript
// .less, .css files
import styles from './styles.less'; // { [key: string]: string }
```

**SVG Files:**
```typescript
// .svg files
import { ReactComponent } from './icon.svg'; // React.FunctionComponent
import icon from './icon.svg'; // any (depends on svgDefaultExport config)
```

### Browser API Extensions

**Window Interface Extensions:**
```typescript
// IDE plugin support
window.editorDispose?.();

// Mini-program integration
window.tt?.miniProgram.postMessage({ data: {...} });

// Coze app integration
window.__cozeapp__?.setLoading?.(true);
```

**Navigator Extensions:**
```typescript
// Standalone app detection
if (navigator.standalone) {
  // Running as standalone web app
}
```

## Development

### Project Structure

```
src/
├── index.d.ts      # Main type definitions and module declarations
├── common.ts       # Common utility types and enums
├── teamspace.ts    # Teamspace-related type definitions
├── data_item.d.ts  # User and authentication type definitions
├── navigator.d.ts  # Navigator API extensions
└── window.d.ts     # Window object extensions
```

### Building

This package contains only TypeScript declarations and requires no build step:

```bash
npm run build  # No-op (exits with code 0)
```

### Linting

```bash
npm run lint
```

### Adding New Types

1. **Module Declarations**: Add to `index.d.ts`
2. **Common Utilities**: Add to `common.ts`
3. **Domain-Specific Types**: Create new files and export from appropriate entry points
4. **Global Extensions**: Add to `window.d.ts` or `navigator.d.ts`

Remember to update the `exports` field in `package.json` for new modules.

## Dependencies

### Runtime Dependencies
None - this package contains only TypeScript type definitions.

### Development Dependencies
- **@coze-arch/bot-env**: Workspace package providing environment-specific typings
- **@coze-arch/eslint-config**: Shared ESLint configuration
- **@coze-arch/ts-config**: Shared TypeScript configuration
- **TypeScript 5.8.2**: Core TypeScript compiler
- **React Types**: For component and SVG type definitions

## License

Apache-2.0

---

**Author**: fanwenjie.fe@bytedance.com

This package is part of the Coze bot platform architecture and provides essential type safety for bot development workflows.
