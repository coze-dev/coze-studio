import { injectable } from 'inversify';

@injectable()
export class MockValidationService {
  validateNode(node) {
    return { hasError: false } as any;
  }
}
