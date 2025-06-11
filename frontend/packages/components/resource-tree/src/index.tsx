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
