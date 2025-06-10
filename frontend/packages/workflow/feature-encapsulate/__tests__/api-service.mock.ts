import { injectable } from 'inversify';

import { type EncapsulateApiService } from '../src/api';
import { complexMock } from './workflow.mock';

@injectable()
export class MockEncapsulateApiService implements EncapsulateApiService {
  encapsulateWorkflow() {
    return Promise.resolve({ workflowId: 'mockWorkflowId' });
  }
  validateWorkflow() {
    return Promise.resolve([]);
  }
  getWorkflow(_spaceId: string, _workflowId: string) {
    return Promise.resolve(complexMock);
  }
}
