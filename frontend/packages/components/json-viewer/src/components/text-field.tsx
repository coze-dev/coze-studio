import React from 'react';

import cls from 'classnames';

const TextField: React.FC<{ text: string }> = ({ text }) => {
  const paragraphs = text.split('\n');

  return (
    <div className={'flex'}>
      <div className={cls('select-auto', 'py-[2px] px-0', 'text-sm')}>
        {paragraphs.map(paragraph => (
          <div className="pl-4" data-testid="json-viewer-text-field-paragraph">
            <span className={'whitespace-pre-wrap'}>
              <span>{paragraph}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { TextField };
