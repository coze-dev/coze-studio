import React from 'react';

import { type ILevelSegment } from '@coze-data/knowledge-stores';

import { Title, Text, Table, Image } from './content-block';

interface IListContentProps {
  segments?: ILevelSegment[];
}

export const ListContent: React.FC<IListContentProps> = ({ segments }) => (
  <div className="flex flex-col gap-2 w-full">
    {segments?.map(content => (
      <div className="flex flex-col gap-2">
        {['title', 'section-title', 'page-title'].includes(content.type) ? (
          <Title title={content.text} id={content.id?.toString()} />
        ) : null}
        {[
          'section-text',
          'header-footer',
          'text',
          'caption',
          'header',
          'footer',
          'formula',
          'footnote',
          'toc',
          'code',
        ].includes(content.type) ? (
          <Text text={content.text} id={content.id?.toString()} />
        ) : null}
        {['image'].includes(content.type) ? (
          <Image
            base64={content.image_detail.base64 ?? ''}
            htmlText={content.html_text || content.text}
            link={content.image_detail.links?.[0] ?? ''}
            caption={content.image_detail.caption ?? ''}
            id={content.id?.toString()}
          />
        ) : null}
        {['table'].includes(content.type) ? (
          <Table
            tableData={content.text || content.html_text}
            id={content.id?.toString()}
          />
        ) : null}
      </div>
    ))}
  </div>
);
