import {
  type FieldRenderProps,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
export type ComponentProps<TValue> = Omit<
  FieldRenderProps<TValue>['field'],
  'key'
>;
export type ArrayComponentProps<TValue> =
  FieldArrayRenderProps<TValue>['field'];
