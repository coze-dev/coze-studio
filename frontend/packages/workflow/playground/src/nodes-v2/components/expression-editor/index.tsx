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
