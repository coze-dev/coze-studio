# @coze-common/chat-core

bot chat core js

## Overview

This package is part of the Coze Studio monorepo and provides utilities functionality. It includes manager, plugin, api and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@coze-common/chat-core": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@coze-common/chat-core';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Manager
- Plugin
- Api
- Sdk

## API Reference

### Exports

- `TokenManager`
- `UploadPluginConstructor,
  UploadEventName,
  UploadResult,
  BaseEventInfo,
  CompleteEventInfo,
  ProgressEventInfo,
  EventPayloadMaps,
  UploadPluginInterface,`
- `type MsgParticipantType,
  type ParticipantInfo,
  GetHistoryMessageResponse,`
- `SdkEventsEnum`
- `default ChatCore;`
- `ChatCore ;`
- `Message,
  ContentType,
  VerboseContent,
  VerboseMsgType,
  AnswerFinishVerboseData,
  FinishReasonType,
  type MessageContent,
  type TextMixItem,
  type TextAndFileMixMessagePropsFilePayload,
  type TextAndFileMixMessagePropsImagePayload,
  type ImageModel,
  type ImageMixItem,
  type FileModel,
  type FileMixItem,
  messageSource,
  type MessageSource,
  type SendMessageOptions,
  type NormalizedMessageProps,
  type NormalizedMessagePropsPayload,
  type MessageMentionListFields,
  type TextAndFileMixMessageProps,
  type TextMessageProps,
  taskType,
  ChatMessageMetaType,
  type ChatMessageMetaInfo,
  type InterruptToolCallsType,`
- `ChatCoreError`
- `MessageFeedbackDetailType,
  MessageFeedbackType,
  ReportMessageAction,
  type ReportMessageProps,
  type ClearMessageContextParams,
  type ClearMessageContextProps,`
- `ChatCoreUploadPlugin`

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
