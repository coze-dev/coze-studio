import { describe, it, expect } from 'vitest';

import { getTriggerId, setTriggerId } from '../trigger-form';

describe('trigger-form', () => {
  it('should set and get a triggerId for a given workflowId', () => {
    const wfId = 'workflow123';
    const triggerId = 'triggerABC';

    setTriggerId(wfId, triggerId);
    const retrievedTriggerId = getTriggerId(wfId);

    expect(retrievedTriggerId).toBe(triggerId);
  });

  it('should return undefined if a triggerId is not set for a workflowId', () => {
    const wfId = 'workflowUnset';
    const retrievedTriggerId = getTriggerId(wfId);

    expect(retrievedTriggerId).toBeUndefined();
  });

  it('should overwrite an existing triggerId if set again for the same workflowId', () => {
    const wfId = 'workflowOverwrite';
    const initialTriggerId = 'triggerInitial';
    const newTriggerId = 'triggerNew';

    setTriggerId(wfId, initialTriggerId);
    expect(getTriggerId(wfId)).toBe(initialTriggerId); // Verify initial set

    setTriggerId(wfId, newTriggerId);
    const retrievedTriggerId = getTriggerId(wfId);

    expect(retrievedTriggerId).toBe(newTriggerId);
  });

  it('should handle multiple workflowIds independently', () => {
    const wfId1 = 'workflowA';
    const triggerId1 = 'triggerA';
    const wfId2 = 'workflowB';
    const triggerId2 = 'triggerB';

    setTriggerId(wfId1, triggerId1);
    setTriggerId(wfId2, triggerId2);

    expect(getTriggerId(wfId1)).toBe(triggerId1);
    expect(getTriggerId(wfId2)).toBe(triggerId2);
  });

  it('should handle empty string as workflowId and triggerId', () => {
    const wfId = '';
    const triggerId = '';

    setTriggerId(wfId, triggerId);
    expect(getTriggerId(wfId)).toBe(triggerId);

    const wfId2 = 'workflowC';
    const triggerId2 = '';
    setTriggerId(wfId2, triggerId2);
    expect(getTriggerId(wfId2)).toBe(triggerId2);

    const wfId3 = '';
    const triggerId3 = 'triggerD';
    setTriggerId(wfId3, triggerId3); // This will overwrite the previous '' wfId
    expect(getTriggerId('')).toBe(triggerId3);
  });
});
