import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ComponentProps } from '@/nodes-v2/components/types';

import {
  ExpressionEditorContainer,
  type ExpressionEditorContainerProps,
} from './container';

export type ExpressionEditorProps = ComponentProps<string> &
  ExpressionEditorContainerProps;

export const ExpressionEditor = (props: ExpressionEditorProps) => {
  const readonly = useReadonly();

  return <ExpressionEditorContainer {...props} readonly={readonly} />;
};
