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

import { EditorRenderer } from '@flowgram-adapter/fixed-layout-editor';
import { type DependencyTree } from '@coze-arch/bot-api/workflow_api';

import { useEditorProps } from './hooks';
import { FixedLayoutEditorProvider } from './fixed-layout-editor-provider';
import { TreeContext } from './contexts';
import { Tools } from './components';
import '@flowgram-adapter/fixed-layout-editor/css-load';
export { NodeType, DependencyOrigin } from './typings';
export { isDepEmpty } from './utils';

export const ResourceTree = ({
  className,
  data,
  renderLinkNode,
}: {
  className?: string;
  data: DependencyTree;
  renderLinkNode?: (extInfo: any) => React.ReactNode;
}) => {
  const initialData = {
    nodes: [],
  };
  const editorProps = useEditorProps(initialData, data);

  return (
    <FixedLayoutEditorProvider {...editorProps}>
      <TreeContext.Provider
        value={{
          renderLinkNode,
        }}
      >
        <div className={className}>
          <EditorRenderer />
          <Tools />
        </div>
      </TreeContext.Provider>
    </FixedLayoutEditorProvider>
  );
};
