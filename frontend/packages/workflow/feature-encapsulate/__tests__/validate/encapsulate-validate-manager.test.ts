/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
