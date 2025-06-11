import {
  DataEvent,
  type EffectOptions,
  type Effect,
} from '@flowgram-adapter/free-layout-editor';
const effect: Effect = ({ context }) => {
  if (!context) {
    return;
  }
  context.playgroundContext.nodesService.fireNodesTitleChange();
};
export const fireNodeTitleChange: EffectOptions[] = [
  {
    event: DataEvent.onValueChange,
    effect,
  },
  {
    event: DataEvent.onValueInit,
    effect,
  },
];
