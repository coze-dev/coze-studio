import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import type { WorkflowGlobalStateEntity } from '@/typing';
import type { WorkflowCustomDragService } from '@/services';

import type {
  WorkflowClipboardNodeJSON,
  WorkflowClipboardSource,
} from '../../../type';

export interface NodeValidationContext {
  node: WorkflowClipboardNodeJSON;
  source: WorkflowClipboardSource;
  globalState: WorkflowGlobalStateEntity;
  dragService: WorkflowCustomDragService;
  parent?: WorkflowNodeEntity;
}

export interface NodeValidator {
  run: (context: NodeValidationContext) => boolean;
  setNext: (validator: NodeValidator) => NodeValidator;
}

export abstract class BaseNodeValidator implements NodeValidator {
  protected next: NodeValidator | null = null;

  setNext(validator: NodeValidator): NodeValidator {
    this.next = validator;
    return validator;
  }

  run(context: NodeValidationContext): boolean {
    const result = this.validate(context);
    if (result !== null) {
      return result;
    }
    return this.next?.run(context) ?? true;
  }

  protected abstract validate(context: NodeValidationContext): boolean | null;
}
