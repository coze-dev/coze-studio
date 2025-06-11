import React, { useEffect, useState } from 'react';

import { type TreeNode } from '../utils/tree';
import { Title, Text, Table, Image } from './content-block';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface ITreeContentProps {
  editable?: boolean;
  content?: TreeNode[];
  selectionIDs?: string[];
  onDeleteSlice?: (sliceID: string) => void;
}

interface SingleContentProps extends Omit<ITreeContentProps, 'content'> {
  editable?: boolean;
  content?: TreeNode;
  selectionIDs?: string[];
  onDeleteSlice?: (sliceID: string) => void;
}

const RenderContent = ({
  content,
  selectionIDs,
  editable,
  onDeleteSlice,
}: SingleContentProps) => {
  const [node, setNode] = useState<React.JSX.Element | null>();

  const ren = () =>
    content?.children.length ? (
      <div className="flex w-full">
        <div className="w-6 shrink-0"></div>
        <div className="flex flex-col w-[calc(100%-24px)] gap-2">
          {content.children.map(
            item => (
              <RenderContent
                content={item}
                selectionIDs={selectionIDs}
                editable={editable}
                onDeleteSlice={onDeleteSlice}
              />
            ),
            // RenderContent(item, selectionIDs, editable, onDeleteSlice),
          )}
        </div>
      </div>
    ) : null;

  useEffect(() => {
    wait(0).then(() => {
      setNode(ren());
    });
  }, [content]);

  if (!content) {
    return null;
  }

  return (
    <div key={content.id} className="flex flex-col gap-2 w-full">
      {['title', 'section-title', 'page-title'].includes(content.type) ? (
        <Title title={content.text} id={content.id} />
      ) : null}
      {[
        'section-text',
        'text',
        'header-footer',
        'caption',
        'header',
        'footer',
        'formula',
        'footnote',
        'toc',
        'code',
      ].includes(content.type) ? (
        <Text
          editable={editable}
          text={content.text}
          selected={selectionIDs?.includes(content.id)}
          id={content.id}
          sliceID={content.slice_id}
          onDeleteSlice={onDeleteSlice}
        />
      ) : null}
      {['image'].includes(content.type) ? (
        <Image
          base64={content.image_detail.base64 ?? ''}
          htmlText={content.html_text || content.text}
          link={content.image_detail.links?.[0] ?? ''}
          caption={content.image_detail.caption ?? ''}
          id={content.id}
          selected={selectionIDs?.includes(content.id)}
        />
      ) : null}
      {['table'].includes(content.type) ? (
        <Table
          tableData={content.text || content.html_text}
          id={content.id}
          selected={selectionIDs?.includes(content.id)}
        />
      ) : null}
      {node}
    </div>
  );
};

export const TreeContent: React.FC<ITreeContentProps> = ({
  editable,
  content,
  selectionIDs,
  onDeleteSlice,
}) => {
  useEffect(() => {
    if (selectionIDs?.length) {
      const firstSelectedId = selectionIDs[0];
      const element = document.getElementById(`segment-${firstSelectedId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectionIDs]);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      {content?.map(
        item => (
          <RenderContent
            content={item}
            selectionIDs={selectionIDs}
            editable={editable}
            onDeleteSlice={onDeleteSlice}
          />
        ),
        // RenderContent(item, selectionIDs, editable, onDeleteSlice),
      )}
    </div>
  );
};
