import { isEqual } from 'lodash';
import { Emitter } from '@flowgram-adapter/common';

export function distinctUntilChangedFromEvent<D, F>(
  emitter: Emitter<D>,
  filter: (_data: D) => F,
): Emitter<F> {
  const nextEmitter = new Emitter<F>();

  let _prevData: F | undefined;
  const _disposeEmitter = nextEmitter.dispose.bind(nextEmitter);
  const _disposeEventListener = emitter.event(_data => {
    const _nextData = filter(_data);
    if (!isEqual(_prevData, _nextData)) {
      _prevData = _nextData;
      nextEmitter.fire(_nextData);
    }
  });

  nextEmitter.dispose = () => {
    _disposeEmitter();
    _disposeEventListener.dispose();
  };

  return nextEmitter;
}
