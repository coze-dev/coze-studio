# @coze-studio/bot-detail-store

bot detail store

## Overview

This package is part of the Coze Studio monorepo and provides state management functionality. It includes hook, store, manager and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-studio/bot-detail-store": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-studio/bot-detail-store';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Hook
- Store
- Manager
- Modal

## API Reference

### Exports

- `avatarBackgroundWebSocket`
- `useBotDetailIsReadonly`
- `TTSInfo,
  type VariableItem,
  VariableKeyErrType,
  type TableMemoryItem,
  type SuggestQuestionMessage,
  type BotDetailSkill,
  type WorkFlowItemType,
  type DatabaseInfo,
  type DatabaseList,
  type KnowledgeConfig,
  type TagListType,
  type ExtendOnboardingContent,
  TimeCapsuleOptionsEnum,`
- `updateHeaderStatus`
- `initBotDetailStore`
- `useBotDetailStoreSet`
- `autosaveManager,
  personaSaveManager,
  botSkillSaveManager,
  multiAgentSaveManager,
  registerMultiAgentConfig,
  getBotDetailDtoInfo,
  saveConnectorType,
  saveDeleteAgents,
  saveUpdateAgents,
  saveMultiAgentData,
  saveFileboxMode,
  saveTableMemory,
  saveTTSConfig,
  saveTimeCapsule,
  saveDevHooksConfig,
  updateShortcutSort,
  updateBotRequest,`
- `getBotDetailIsReadonly`
- `uniqMemoryList`
- `verifyBracesAndToast`

*And more...*

For detailed API documentation, please refer to the TypeScript definitions.

## Development

This package is built with:

- TypeScript
- Modern JavaScript
- Vitest for testing
- ESLint for code quality

## Contributing

This package is part of the Coze Studio monorepo. Please follow the monorepo contribution guidelines.

## License

Apache-2.0
