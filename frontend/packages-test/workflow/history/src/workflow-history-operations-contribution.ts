import { injectable } from 'inversify';
import {
  type OperationContribution,
  type OperationRegistry,
} from '@flowgram-adapter/free-layout-editor';

import { operationMetas } from './operation-metas';

@injectable()
export class WorklfowHistoryOperationsContribution
  implements OperationContribution
{
  registerOperationMeta(operationRegistry: OperationRegistry): void {
    operationMetas.forEach(operationMeta => {
      operationRegistry.registerOperationMeta(operationMeta);
    });
  }
}
