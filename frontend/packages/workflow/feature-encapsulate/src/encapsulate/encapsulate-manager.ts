import { injectable } from 'inversify';
import { DisposableCollection } from '@flowgram-adapter/common';

import { type EncapsulateManager } from './types';

@injectable()
export class EncapsulateManagerImpl implements EncapsulateManager {
  private toDispose: DisposableCollection = new DisposableCollection();

  init() {
    this.toDispose.pushAll([]);
  }
  dispose() {
    this.toDispose.dispose();
  }
}
