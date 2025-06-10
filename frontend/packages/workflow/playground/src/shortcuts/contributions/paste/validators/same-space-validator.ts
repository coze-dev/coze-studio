import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class SameSpaceValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { source, globalState } = context;

    return source.spaceId === globalState.spaceId ? true : null;
  }
}
