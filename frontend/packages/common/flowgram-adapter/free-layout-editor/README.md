# @flowgram-adapter/free-layout-editor

对 flowgram 的封装

## Overview

This package is part of the Coze Studio monorepo and provides utilities functionality. It includes component, store, service and more.

## Getting Started

### Installation

Add this package to your `package.json`:

```json
{
  "dependencies": {
    "@flowgram-adapter/free-layout-editor": "workspace:*"
  }
}
```

Then run:

```bash
rush update
```

### Usage

```typescript
import { /* exported functions/components */ } from '@flowgram-adapter/free-layout-editor';

// Example usage
// TODO: Add specific usage examples
```

## Features

- Component
- Store
- Service
- Manager
- Editor
- Plugin
- Validation
- Logger

## API Reference

### Exports

- `FlowMinimapService,
  MinimapRender,
  createMinimapPlugin,`
- `type WorkflowNodeJSON,
  type InteractiveType,
  type WorkflowNodeRegistry,
  type WorkflowNodeMeta,
  type WorkflowLinePortInfo,
  type WorkflowJSON,
  type WorkflowContentChangeEvent,
  type WorkflowSubCanvas,
  type WorkflowNodeRenderProps,
  type WorkflowPortType,
  type WorkflowNodeFormMeta,
  LineType,
  usePlayground,
  useService,
  WorkflowContentChangeType,
  WorkflowDocument,
  useCurrentEntity,
  useNodeRender,
  WorkflowHoverService,
  WorkflowSelectService,
  WorkflowDocumentOptions,
  WorkflowNodeEntity,
  WorkflowCommands,
  WorkflowNodeLinesData,
  WorkflowNodePortsData,
  WorkflowPortEntity,
  nanoid,
  WorkflowDocumentContainerModule,
  WorkflowLinesManager,
  LineColors,
  useRefresh,
  getAntiOverlapPosition,
  bindConfigEntity,
  WorkflowDragService,
  delay,
  WorkflowLineEntity,
  WorkflowResetLayoutService,
  WorkflowDocumentProvider,
  POINT_RADIUS,
  WorkflowLineRenderData,
  usePlaygroundReadonlyState,
  type WorkflowEdgeJSON,`
- `FormModelV2,
  type FieldRenderProps,
  type PlaygroundTools,
  type FieldError,
  type FieldName,
  type IForm,
  type IField,
  type IFieldArray,
  type FieldState,
  type FormMeta as FormMetaV2,
  type FormMeta,
  type Validate,
  type FieldArrayRenderProps,
  type Effect,
  type FormRenderProps,
  type EffectOptions,
  type FieldWarning,
  usePlaygroundTools,
  isFormV2,
  Field,
  Form,
  PlaygroundEntityContext,
  FieldArray,
  useFieldValidate,
  useCurrentField,
  useCurrentFieldState,
  useForm,
  useWatch,
  // useFormItemValidate,
  ValidateTrigger,
  useWatchFormErrors,
  DataEvent,
  useField,
  FlowNodeVariableData,
  ASTKind,
  createEffectOptions,
  Emitter,`
- `type PluginCreator,
  type PluginContext,
  type PositionSchema,
  type PlaygroundConfigRevealOpts,
  type PlaygroundDragEvent,
  type LayerOptions,
  type Plugin,
  EntityData,
  PositionData,
  useEntityFromContext,
  ClipboardService,
  ConfigEntity,
  Layer,
  PlaygroundConfigEntity,
  observeEntity,
  PlaygroundReactRenderer,
  PlaygroundMockTools,
  PlaygroundContext,
  bindContributions,
  Playground,
  loadPlugins,
  EntityManagerContribution,
  definePluginCreator,
  TransformData,
  EntityManager,
  LoggerEvent,
  LoggerService,
  lazyInject,
  useConfigEntity,
  SelectionService,
  SCALE_WIDTH,
  EditorState,
  EditorStateConfigEntity,
  observeEntities,
  observeEntityDatas,
  PlaygroundContribution,
  PlaygroundLayer,
  PlaygroundReactProvider,
  CommandRegistry,`
- `type FlowNodeJSON,
  type FlowNodeType,
  FlowNodeRenderData,
  FlowDocumentContribution,
  FlowNodeTransformData,
  FlowDocumentContainerModule,
  FlowNodeBaseType,
  FlowNodeEntity,
  FlowDocument,`
- `type FeedbackStatus,
  type SetterComponentProps,
  type NodeManager,
  type SetterOrDecoratorContext,
  type FormItemFeedback,
  type DecoratorComponentProps,
  type DecoratorExtension,
  type SetterExtension,
  type ValidatorProps,
  type SetterAbilityOptions,
  type FormItemMaterialContext,
  type FormDataTypeName,
  type IFormItemMeta,
  FlowNodeFormData,
  FlowNodeErrorData,
  FormModelFactory,
  createNodeContainerModules,
  createNodeEntityDatas,
  NodeRender,
  getNodeError,
  registerNodeErrorRender,
  registerNodePlaceholderRender,
  FormContribution,
  NodeContribution,
  DecoratorAbility,
  SetterAbility,
  FormManager,
  type NodeErrorRenderProps,
  FormPathService,
  type NodeContext,
  type NodeFormContext,`
- `type FlowSelectorBoundsLayerOptions,
  SelectorBoxConfigEntity,
  FlowRendererKey,
  FlowRendererRegistry,
  FlowRendererContribution,
  FlowDebugLayer,
  FlowNodesContentLayer,
  FlowNodesTransformLayer,
  FlowScrollBarLayer,
  FlowSelectorBoundsLayer,
  FlowSelectorBoxLayer,
  FlowRendererContainerModule,`
- `type DragNodeOperationValue,
  type AddOrDeleteLineOperationValue,
  type AddOrDeleteWorkflowNodeOperationValue,
  type ChangeNodeDataValue,
  createFreeHistoryPlugin,
  FreeOperationType,
  HistoryService,`
- `//   FormRehajeContainerModule,
//   registerValidationErrorMessages,
//   useFormItemContext,
//   markParsed,
//`
- `type NodePanelRenderProps,
  WorkflowNodePanelService,
  createFreeNodePanelPlugin,`

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
