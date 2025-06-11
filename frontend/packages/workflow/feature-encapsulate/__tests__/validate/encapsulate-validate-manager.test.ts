import { describe, it, beforeEach, expect } from 'vitest';
import { StandardNodeType } from '@coze-workflow/base/types';

import { createContainer } from '../create-container';
import { EncapsulateValidateManager } from '../../src/validate';

describe('encapsulate-validate-manager', () => {
  let encapsulateValidateManager: EncapsulateValidateManager;
  beforeEach(() => {
    const container = createContainer();
    encapsulateValidateManager = container.get<EncapsulateValidateManager>(
      EncapsulateValidateManager,
    );
  });

  it('should register validator', () => {
    const validators = encapsulateValidateManager.getNodeValidators();
    expect(validators.length > 0).toBeTruthy();
  });

  it('should register nodes validators', () => {
    const validators = encapsulateValidateManager.getNodesValidators();
    expect(validators.length > 0).toBeTruthy();
  });

  it('should get validators by type', () => {
    const validators = encapsulateValidateManager.getNodeValidatorsByType(
      StandardNodeType.Start,
    );
    expect(validators.length > 0).toBeTruthy();
  });

  it('should register workflow json validators', () => {
    const validators = encapsulateValidateManager.getWorkflowJSONValidators();
    expect(validators.length > 0).toBeTruthy();
  });
});
