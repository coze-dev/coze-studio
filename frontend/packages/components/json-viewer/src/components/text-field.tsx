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
