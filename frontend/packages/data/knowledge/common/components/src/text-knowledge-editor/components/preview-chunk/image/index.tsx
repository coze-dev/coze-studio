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

import DOMPurify from 'dompurify';
import cls from 'classnames';

export const ImageChunkPreview = ({
  base64,
  htmlText,
  link,
  caption,
  locateId,
  selected,
}: {
  base64?: string;
  htmlText?: string;
  link?: string;
  caption?: string;
  locateId: string;
  selected?: boolean;
}) => (
  <div
    id={locateId}
    className={cls(
      'flex items-center flex-col gap-2',
      'w-full p-2 coz-mg-secondary',
      'border border-solid coz-stroke-primary rounded-[8px]',
      selected && '!coz-mg-hglt',
    )}
  >
    {base64 ? (
      <img
        src={`data:image/jpeg;base64, ${base64}`}
        className="w-full h-full"
      />
    ) : null}
    {htmlText ? (
      <div
        className="w-full h-full overflow-auto [&>*]:w-full [&>*]:h-full"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlText) }}
      />
    ) : null}
    {link ? (
      <div className="coz-fg-primary text-[14px] leading-[20px] font-[400] break-all">
        {link}
      </div>
    ) : null}
    {caption ? (
      <div className="coz-fg-primary text-[14px] leading-[20px] font-[400] break-all">
        {caption}
      </div>
    ) : null}
  </div>
);
